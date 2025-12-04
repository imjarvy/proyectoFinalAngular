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
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#0A192F]">
      <div class="w-full max-w-7xl mx-auto rounded-sm border border-[#9CA3AF] bg-[#F9FAFB] shadow-default dark:border-[#5B5B60] dark:bg-[#0A192F]">
        <div class="flex flex-wrap items-center">
          <div class="hidden w-full xl:block xl:w-1/2">
            <div class="px-26 py-17.5 text-center bg-[#DDDCDB] dark:bg-[#2D3748]">
              <p class="2xl:px-20 text-[#1E3A8A] dark:text-[#F5F7FA]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit suspendisse.
              </p>
            </div>
          </div>

          <div class="w-full border-[#9CA3AF] dark:border-[#5B5B60] xl:w-1/2 xl:border-l-2">
            <div class="w-full p-4 sm:p-12.5 xl:p-17.5">
              <span class="mb-1.5 block font-medium text-[#1E3A8A] dark:text-[#1E40AF]">Start for free</span>
              <h2 class="mb-9 text-2xl font-bold text-[#1E3A8A] dark:text-[#F5F7FA] sm:text-title-xl2">
                Sign In
              </h2>

              <div *ngIf="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ error }}
              </div>

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 gap-4 p-6 bg-white rounded-md shadow-md">
                <div>
                  <label for="email" class="block text-lg font-medium text-[#1E3A8A] dark:text-[#F5F7FA]">Email</label>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="w-full border border-[#9CA3AF] dark:border-[#5B5B60] bg-[#F9FAFB] dark:bg-[#0A192F] text-[#1E3A8A] dark:text-[#F5F7FA] rounded-md p-2 focus:border-[#359E39] focus:ring-[#359E39]"
                  />
                  <p *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="text-red-500 text-sm">
                    Email inválido
                  </p>
                </div>

                <div>
                  <label for="password" class="block text-lg font-medium text-[#1E3A8A] dark:text-[#F5F7FA]">Password</label>
                  <input
                    id="password"
                    type="password"
                    formControlName="password"
                    class="w-full border border-[#9CA3AF] dark:border-[#5B5B60] bg-[#F9FAFB] dark:bg-[#0A192F] text-[#1E3A8A] dark:text-[#F5F7FA] rounded-md p-2 focus:border-[#359E39] focus:ring-[#359E39]"
                  />
                  <p *ngIf="form.get('password')?.invalid && form.get('password')?.touched" class="text-red-500 text-sm">
                    La contraseña es obligatoria
                  </p>
                </div>

                <button
                  type="submit"
                  [disabled]="form.invalid || isSubmitting"
                  class="w-full cursor-pointer rounded-lg border border-[#359E39] bg-[#359E39] p-4 text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Login
                </button>

                <button
                  type="button"
                  (click)="handleGoogleSignIn()"
                  [disabled]="isGoogleLoading"
                  class="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray p-4 hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span *ngIf="!isGoogleLoading">Sign in with Google</span>
                  <span *ngIf="isGoogleLoading">Signing in...</span>
                </button>

                <button
                  type="button"
                  (click)="handleMicrosoftLogin()"
                  class="flex w-full items-center justify-center gap-3.5 rounded-lg border border-[#9CA3AF] dark:border-[#5B5B60] bg-[#DDDCDB] dark:bg-[#2D3748] p-4 hover:bg-opacity-50 dark:hover:bg-opacity-50 text-[#1E3A8A] dark:text-[#F5F7FA]"
                >
                  <span>Sign in with Microsoft</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
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

  async handleMicrosoftLogin(): Promise<void> {
    try {
      console.log('1. Iniciando login con Microsoft...');
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
