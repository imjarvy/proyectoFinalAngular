/**
 * Componente Angular equivalente a FirebaseStatus (MUI -> simple markup).
 * Muestra estado de Firebase y usuario desde un AuthContext equivalente (no incluido aquí).
 * Sólo es un componente UI para debugging.
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-firebase-status',
  imports: [CommonModule],
  template: `
    <div class="card mx-auto mt-4" style="max-width:600px">
      <div class="p-4">
        <h3>🔥 Firebase Authentication Status</h3>
        <div class="mb-2">
          <small>Firebase Configuration:</small>
          <span class="px-2">{{ firebaseConfigured ? '✅ Configured' : '⚠️ Development Mode' }}</span>
        </div>
        <div class="mb-2">
          <small>Authentication Status:</small>
          <span class="px-2">{{ loading ? '⏳ Loading...' : (isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated') }}</span>
        </div>

        <div *ngIf="currentUser" class="mb-2">
          <small>Current User:</small>
          <div>• Name: {{ currentUser.name }}</div>
          <div>• Email: {{ currentUser.email }}</div>
          <div>• Provider: {{ currentUser.provider }}</div>
        </div>

        <div *ngIf="!firebaseConfigured" style="margin-top:12px; padding:8px; background:#fff7cd;">
          <div>🔧 Para habilitar Google OAuth real:</div>
          <div>1. Configura Firebase en src/config/firebase.config.ts</div>
          <div>2. Revisa FIREBASE_SETUP.md</div>
        </div>
      </div>
    </div>
  `
})
export class FirebaseStatusComponent {
  @Input() currentUser: any | null = null;
  @Input() loading = false;
  @Input() isAuthenticated = false;
  @Input() firebaseConfigured = false;
}