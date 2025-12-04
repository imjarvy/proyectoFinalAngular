import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { MicrosoftLoginButtonComponent } from './microsoft-login-button.component';
import { MicrosoftUserProfileComponent } from './user-profile.component';

@Component({
  standalone: true,
  selector: 'app-microsoft-auth-page',
  imports: [CommonModule, MicrosoftLoginButtonComponent, MicrosoftUserProfileComponent],
  template: `
    <div class="grid grid-cols-1 gap-9">
      <div class="flex flex-col gap-9">
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
              {{ isAuthenticated() ? '¡Bienvenido!' : 'Iniciar Sesión' }}
            </h3>
          </div>
          <div class="p-6.5">
            <ng-container *ngIf="!isAuthenticated(); else authenticatedBlock">
              <div class="space-y-4">
                <p class="text-body">
                  Inicia sesión con tu cuenta de Microsoft para acceder a todas las funcionalidades de la aplicación.
                </p>
                <app-microsoft-login-button></app-microsoft-login-button>

                <div class="mt-4 rounded-md bg-primary/10 p-4">
                  <h4 class="mb-2 font-semibold text-black dark:text-white">ℹ️ Información</h4>
                  <ul class="list-inside list-disc space-y-1 text-sm text-body">
                    <li>Utiliza tu cuenta corporativa o personal de Microsoft</li>
                    <li>La autenticación es segura mediante OAuth 2.0</li>
                    <li>Solo solicitamos permisos básicos de lectura de perfil</li>
                  </ul>
                </div>
              </div>
            </ng-container>

            <ng-template #authenticatedBlock>
              <div class="space-y-4">
                <div class="rounded-md bg-success/10 p-4">
                  <p class="text-success">
                    ✓ Autenticado exitosamente como <strong>{{ firstAccountName() }}</strong>
                  </p>
                </div>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <ng-container *ngIf="isAuthenticated()">
        <div class="flex flex-col gap-9">
          <app-microsoft-user-profile></app-microsoft-user-profile>
        </div>
      </ng-container>

      <div class="flex flex-col gap-9">
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">Información Técnica</h3>
          </div>
          <div class="p-6.5">
            <div class="space-y-3">
              <div>
                <span class="mb-1 block text-sm font-medium text-black dark:text-white">Estado de autenticación</span>
                <p class="text-sm text-body">
                  {{ isAuthenticated() ? '🟢 Autenticado' : '🔴 No autenticado' }}
                </p>
              </div>

              <div>
                <span class="mb-1 block text-sm font-medium text-black dark:text-white">Número de cuentas activas</span>
                <p class="text-sm text-body">{{ accountsCount() }}</p>
              </div>

              <ng-container *ngIf="accountsCount() > 0">
                <div>
                  <span class="mb-1 block text-sm font-medium text-black dark:text-white">Tipo de cuenta</span>
                  <p class="text-sm text-body">
                    {{ accountType() }}
                  </p>
                </div>

                <div>
                  <span class="mb-1 block text-sm font-medium text-black dark:text-white">Username</span>
                  <p class="text-sm text-body break-all">{{ firstAccountUsername() }}</p>
                </div>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MicrosoftAuthPageComponent {
  private accountsSignal = signal<any[]>([]);

  isAuthenticated = computed(() => this.accountsSignal().length > 0);
  accountsCount = computed(() => this.accountsSignal().length);

  firstAccountName = computed(() => this.accountsSignal()[0]?.name ?? '');
  firstAccountUsername = computed(() => this.accountsSignal()[0]?.username ?? '');
  accountType = computed(() => {
    const tid = (this.accountsSignal()[0]?.idTokenClaims as any)?.['tid'];
    return tid ? 'Azure AD' : 'Personal';
  });

  constructor(private msalService: MsalService) {
    this.accountsSignal.set(this.msalService.instance.getAllAccounts());
  }
}
