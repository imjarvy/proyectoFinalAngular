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
  templateUrl: './microsoft-login-button.component.html',
  styleUrls: ['./microsoft-login-button.component.css'],
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