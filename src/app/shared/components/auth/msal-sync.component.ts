/**
 * Componente que sincroniza estado MSAL con MicrosoftAuthService al cargar la app.
 * Este reemplaza al MsalSync React component.
 *
 * Debe colocarse en un punto superior de la app (ej: AppComponent template).
 */

import { Component, OnInit } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { filter } from 'rxjs/operators';
import { MicrosoftGraphService } from '../../../core/services/microsoft-graph.service';
import { MicrosoftAuthService } from '../../../core/services/microsoft-auth.service';
import securityService from '../../../core/services/security.service'; // ajustar ruta si aplica

@Component({
  standalone: true,
  selector: 'app-msal-sync',
  template: `<ng-content></ng-content>`
})
export class MsalSyncComponent implements OnInit {
  /** Para evitar reintentos infinitos */
  private hasTriedInitialSync = false;

  constructor(
    private msalService: MsalService,
    private msalBroadcast: MsalBroadcastService,
    private graph: MicrosoftGraphService,
    private authState: MicrosoftAuthService
  ) {}

  async ngOnInit(): Promise<void> {
    // Asegurar inicialización de MSAL antes de interactuar con la instancia
    if (typeof (this.msalService as any).initialize === 'function') {
      await (this.msalService as any).initialize();
    }

    // Intentamos sincronizar cuando haya cuentas disponibles
    const accounts = this.msalService.instance.getAllAccounts();

    // Solo intentamos una vez al inicio; si falla, no spameamos.
    if (!this.hasTriedInitialSync && accounts.length > 0) {
      this.hasTriedInitialSync = true;
      try {
        await this.syncMsalToState(accounts[0]);
      } catch (e) {
        console.warn('MsalSync: no se pudo sincronizar al iniciar, se ignora:', e);
      }
    }

    // También escuchamos eventos MSAL (opcional)
    this.msalBroadcast.msalSubject$
      .pipe(filter(() => true))
      .subscribe(() => {
        const a = this.msalService.instance.getAllAccounts();

        // Si ya sincronizamos una vez en esta sesión, no volvemos a llamar a Graph
        if (this.hasTriedInitialSync) {
          return;
        }

        if (a.length > 0) {
          this.hasTriedInitialSync = true;
          this.syncMsalToState(a[0]).catch(err => {
            console.warn('MsalSync: error al sincronizar desde evento, se ignora:', err);
          });
        }
      });
  }

  private async syncMsalToState(account: any) {
    try {
      this.authState.setLoading(true);
      const tokenResponse: any = await this.msalService.acquireTokenSilent({
        scopes: ['User.Read'],
        account,
      });

      const userData = await this.graph.callMsGraph(tokenResponse.accessToken);

      const normalizedUser = {
        id: userData.id,
        displayName: userData.displayName,
        email: userData.mail ?? userData.userPrincipalName,
        givenName: userData.givenName,
        surname: userData.surname,
        userPrincipalName: userData.userPrincipalName,
        jobTitle: userData.jobTitle,
        officeLocation: userData.officeLocation,
        mobilePhone: userData.mobilePhone,
        provider: 'microsoft',
        token: tokenResponse.accessToken,
      };

      this.authState.setAuthenticated(true);
      this.authState.setUserData(userData);
      this.authState.setAccessToken(tokenResponse.accessToken);

      // Integración con backend (igual que en original)
      try {
        await securityService.loginWithMicrosoft(normalizedUser);
        console.log('✅ Usuario autenticado en backend también');
      } catch (backendError) {
        console.warn('⚠️ Error al integrar con backend, pero Microsoft OK:', backendError);
        window.dispatchEvent(
          new CustomEvent('authStateChanged', {
            detail: {
              user: normalizedUser,
              token: tokenResponse.accessToken,
            },
          })
        );
      }

      // Foto
      try {
        const photo = await this.graph.getUserPhoto(tokenResponse.accessToken);
        if (photo) this.authState.setUserPhoto(photo);
      } catch (photoErr) {
        console.warn('No se pudo obtener la foto del usuario');
      }

      this.authState.setLoading(false);
      console.log('🔄 MsalSync: Sincronización Microsoft completada');
    } catch (error) {
      console.error('Error al sincronizar datos:', error);
      this.authState.setLoading(false);
      this.authState.setError('Error al sincronizar MSAL');
    }
  }
}