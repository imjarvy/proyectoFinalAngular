/**
 * Componente que muestra la información del usuario autenticado con Microsoft.
 * Usa MicrosoftAuthService como fuente de verdad (equivalente a los selectors de Redux).
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MicrosoftAuthService } from '../../../core/services/microsoft-auth.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-microsoft-user-profile',
  imports: [CommonModule],
  template: `
    <div *ngIf="state$ | async as s">
      <ng-container *ngIf="s.loading">
        <div class="flex items-center justify-center p-8">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      </ng-container>

      <ng-container *ngIf="!s.loading && s.user">
        <div class="rounded-sm border border-stroke bg-white shadow-default">
          <div class="border-b border-stroke px-7 py-4">
            <h3 class="font-medium text-black">Perfil de Microsoft</h3>
          </div>
          <div class="p-7">
            <div class="mb-5.5 flex items-center gap-5">
              <div class="h-20 w-20 rounded-full overflow-hidden">
                <img *ngIf="s.photo" [src]="s.photo" alt="{{ s.user.displayName }}" class="h-full w-full object-cover" />
                <div *ngIf="!s.photo" class="flex h-full w-full items-center justify-center bg-primary text-white text-2xl font-bold">
                  {{ s.user.givenName?.[0] }}{{ s.user.surname?.[0] }}
                </div>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-black">{{ s.user.displayName }}</h4>
                <p class="text-sm text-body">{{ s.user.mail }}</p>
                <p *ngIf="s.user.jobTitle" class="text-sm text-body">{{ s.user.jobTitle }}</p>
              </div>
            </div>

            <div class="space-y-3">
              <div><span class="mb-1 block text-sm font-medium text-black">Nombre completo</span>
                <p class="text-sm text-body">{{ s.user.givenName }} {{ s.user.surname }}</p></div>
              <div><span class="mb-1 block text-sm font-medium text-black">Email</span>
                <p class="text-sm text-body">{{ s.user.userPrincipalName }}</p></div>
              <div *ngIf="s.user.officeLocation"><span class="mb-1 block text-sm font-medium text-black">Ubicación</span>
                <p class="text-sm text-body">{{ s.user.officeLocation }}</p></div>
              <div *ngIf="s.user.mobilePhone"><span class="mb-1 block text-sm font-medium text-black">Teléfono móvil</span>
                <p class="text-sm text-body">{{ s.user.mobilePhone }}</p></div>
            </div>

            <button (click)="handleLogout()" class="mt-5 inline-flex items-center justify-center rounded-md bg-meta-1 px-10 py-4 text-white">Cerrar sesión</button>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class MicrosoftUserProfileComponent {
  state$: Observable<any>;

  constructor(
    private authState: MicrosoftAuthService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.state$ = this.authState.state;
  }

  async handleLogout() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/auth/signin']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}