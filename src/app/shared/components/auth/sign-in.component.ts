import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { FirebaseAuthProviderService } from '../../../core/services/firebase-auth-provider.service';
import { MicrosoftGraphService } from '../../../core/services/microsoft-graph.service';
import { MicrosoftAuthService } from '../../../core/services/microsoft-auth.service';
import { AuthService } from '../../../core/services/auth.service';
import securityService from '../../../core/services/security.service';
import { loginRequest } from '../../../core/config/msal-config';
import { firstValueFrom } from 'rxjs';
import type { AuthenticationResult } from '@azure/msal-browser';

@Component({
  standalone: true,
  selector: 'app-sign-in',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent {
  form: FormGroup;
  isGoogleLoading = false;
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firebaseAuth: FirebaseAuthProviderService,
    private msalService: MsalService,
    private graphService: MicrosoftGraphService,
    private msAuthState: MicrosoftAuthService,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.error = null;
    const values = this.form.value as { email: string; password: string };

    try {
      const response = await securityService.loginWithMicrosoft(values);
      console.log('Usuario autenticado:', response);
      await this.router.navigate(['/dashboard/client']);
    } catch (err) {
      console.error('Error al iniciar sesión', err);
      this.error = 'Error al iniciar sesión. Verifica tus credenciales.';
    } finally {
      this.isSubmitting = false;
    }
  }

  async handleGoogleSignIn(): Promise<void> {
    this.isGoogleLoading = true;
    this.error = null;
    try {
			await this.authService.signInWithGoogle();
			console.log('Google login exitoso');
      await this.router.navigate(['/dashboard/client']);
    } catch (err: any) {
      console.error('Error en Google login:', err);
      this.error = err?.message || 'Error al iniciar sesión con Google';
    } finally {
      this.isGoogleLoading = false;
    }
  }

  async handleGithubSignIn(): Promise<void> {
    this.isGoogleLoading = true;
    this.error = null;
    try {
			await this.authService.signInWithGithub();
			console.log('GitHub login exitoso');
      await this.router.navigate(['/dashboard/client']);
    } catch (err: any) {
      console.error('Error en GitHub login:', err);
      this.error = err?.message || 'Error al iniciar sesión con GitHub';
    } finally {
      this.isGoogleLoading = false;
    }
  }

  async handleMicrosoftLogin(): Promise<void> {
    try {
      console.log('1. Iniciando login con Microsoft...');

      // Asegurar que MSAL esté inicializado antes de usar cualquier API
      if (typeof (this.msalService as any).initialize === 'function') {
        await (this.msalService as any).initialize();
      }

      const loginResponse = (await firstValueFrom(
        this.msalService.loginPopup(loginRequest)
      )) as AuthenticationResult;
      console.log('2. Login exitoso:', loginResponse);

      const tokenResponse = await firstValueFrom(
    this.msalService.acquireTokenSilent({
      scopes: ['User.Read'],
      account: loginResponse.account,
    })
  );
      console.log('3. Token obtenido');

      console.log('4. Obteniendo datos del usuario...');
      const userData = await this.graphService.callMsGraph(tokenResponse.accessToken);
      console.log('5. Datos del usuario obtenidos:', userData);

      this.msAuthState.setAuthenticated(true);
      this.msAuthState.setUserData(userData);
      this.msAuthState.setAccessToken(tokenResponse.accessToken);
      console.log('6. Datos guardados en estado MS');

      try {
        const photo = await this.graphService.getUserPhoto(tokenResponse.accessToken);
        if (photo) {
          this.msAuthState.setUserPhoto(photo);
          console.log('7. Foto guardada');
        }
      } catch (photoError) {
        console.warn('No se pudo obtener la foto del usuario:', photoError);
      }

      await this.router.navigate(['/dashboard/client']);
    } catch (error) {
      console.error('Error al iniciar sesión con Microsoft:', error);
      this.error = 'Error al iniciar sesión con Microsoft';
    }
  }
}
