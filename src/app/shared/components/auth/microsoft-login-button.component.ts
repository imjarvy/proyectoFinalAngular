/**
 * Componente Angular equivalente al botón de Microsoft.
 * Usa @azure/msal-angular MsalService para realizar loginPopup.
 *
 * Nota: importar y configurar MSAL en AppModule es requisito (msalConfig, MsalModule).
 */

import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { loginRequest } from '../../../core/config/msal-config';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-microsoft-login-button',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-4">
      <button (click)="handleLogin()" class="flex items-center justify-center gap-3 rounded-lg border border-stroke bg-white p-4 hover:bg-gray-2">
        <span>
          <!-- SVG idéntico al original -->
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
            <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
            <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
            <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
          </svg>
        </span>
        Iniciar sesión con Microsoft
      </button>
    </div>
  `
})
export class MicrosoftLoginButtonComponent {
  constructor(private msalService: MsalService) {}

  async handleLogin(): Promise<void> {
    try {
      // loginPopup similar al original
      const response = await this.msalService.loginPopup(loginRequest);
      console.log('Login exitoso:', response);
      // Toasts no incluidos aquí; puedes inyectar un servicio de notificaciones si quieres
    } catch (error) {
      console.error('Error en el login:', error);
    }
  }
}