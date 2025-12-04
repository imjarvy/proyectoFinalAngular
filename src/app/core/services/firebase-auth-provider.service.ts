/**
 * Adaptación del FirebaseAuthProvider a Angular como un @Injectable service.
 * Mantiene la lógica original (initialize, signIn, signOut, getCurrentUser, mapping, debug).
 *
 * Requiere dependencias de firebase instaladas (firebase/app, firebase/auth).
 */

import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { isFirebaseConfigured } from '../config/firebase.config';
import { environment } from '../../../environments/environment';
import { UserStorageManager } from '../utils/storage-manager';
import { AuthUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthProviderService {
  // Usamos directamente la configuración de Firebase del environment de Angular
  private config: any = (window as any).__FIREBASE_CONFIG__ || environment.firebase;
  private isInitialized = false;
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private provider: GoogleAuthProvider | null = null;
  private githubProvider: GithubAuthProvider | null = null;

  constructor() {}

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      if (!isFirebaseConfigured()) {
        console.warn('Firebase no configurado. Usando modo desarrollo.');
        this.isInitialized = true;
        return;
      }
      this.app = initializeApp(this.config);
      this.auth = getAuth(this.app);
      this.provider = new GoogleAuthProvider();
      this.provider.addScope('email');
      this.provider.addScope('profile');
      this.provider.setCustomParameters({ prompt: 'select_account' });
      this.githubProvider = new GithubAuthProvider();
      this.githubProvider.addScope('user:email');
      this.isInitialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      throw error;
    }
  }

  async signIn(): Promise<{ user: AuthUser; token: string; refreshToken?: string }> {
    await this.initialize();
    try {
      if (!isFirebaseConfigured() || !this.auth || !this.provider) {
        console.warn('Using development auth (Firebase not configured)');
        const temp = this.createTemporaryAuthResult();
        return temp;
      }
      const result = await signInWithPopup(this.auth, this.provider);
      const firebaseUser = result.user;
      if (!firebaseUser.email) {
        await (firebaseUser as any).reload?.();
      }
      const token = await firebaseUser.getIdToken();
      return this.mapFirebaseUserToAuthResult(firebaseUser, token);
    } catch (error: any) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  async signInWithGithub(): Promise<{ user: AuthUser; token: string; refreshToken?: string }> {
    await this.initialize();
    try {
      if (!isFirebaseConfigured() || !this.auth || !this.githubProvider) {
        console.warn('Using development auth (Firebase GitHub not configured)');
        const temp = this.createTemporaryAuthResult();
        temp.user.provider = 'github';
        return temp;
      }
      const result = await signInWithPopup(this.auth, this.githubProvider);
      const firebaseUser = result.user;
      if (!firebaseUser.email) {
        await (firebaseUser as any).reload?.();
      }
      const token = await firebaseUser.getIdToken();
      const mapped = this.mapFirebaseUserToAuthResult(firebaseUser, token);
      mapped.user.provider = 'github';
      return mapped;
    } catch (error: any) {
      console.error('GitHub sign in failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await this.initialize();
    try {
      if (!isFirebaseConfigured() || !this.auth) {
        console.warn('Using development sign out (Firebase not configured)');
        localStorage.removeItem('user');
        return;
      }
      await firebaseSignOut(this.auth);
      localStorage.removeItem('user');
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    await this.initialize();
    try {
      if (!isFirebaseConfigured() || !this.auth) {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
      }
      const firebaseUser = this.auth.currentUser;
      if (!firebaseUser) return null;
      const token = await firebaseUser.getIdToken();
      return this.mapFirebaseUserToUser(firebaseUser, token);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // helpers (similar mapping logic)
  private createTemporaryAuthResult() {
    const user: AuthUser = {
      id: Date.now().toString(),
      name: 'Usuario de Desarrollo',
      email: 'dev@example.com',
      token: `temp_token_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      provider: 'google',
    };
    UserStorageManager.saveUser(user);
    return { user, token: user.token as string, refreshToken: `refresh_${Date.now()}` };
  }

  private mapFirebaseUserToAuthResult(firebaseUser: FirebaseUser, token: string) {
    let userEmail = firebaseUser.email;
    if (!userEmail && firebaseUser.providerData && firebaseUser.providerData.length > 0) {
      const googleProvider = firebaseUser.providerData.find(p => p.providerId === 'google.com');
      const githubProvider = firebaseUser.providerData.find(p => p.providerId === 'github.com');

      if (googleProvider && (googleProvider as any).email) {
        userEmail = (googleProvider as any).email;
      } else if (githubProvider && (githubProvider as any).email) {
        userEmail = (githubProvider as any).email;
      }
    }

    // Si aún no hay email (por ejemplo, usuario de GitHub con email privado), usamos un placeholder
    if (!userEmail) {
      userEmail = `no-email-${firebaseUser.uid}@github.local`;
    }
    const user: AuthUser = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Usuario Sin Nombre',
      email: userEmail,
      token,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      provider: 'google',
    };
    UserStorageManager.saveUser(user);
    return { user, token, refreshToken: `refresh_${Date.now()}` };
  }

  private mapFirebaseUserToUser(firebaseUser: FirebaseUser, token: string): AuthUser {
    let userEmail = firebaseUser.email;
    if (!userEmail && firebaseUser.providerData && firebaseUser.providerData.length > 0) {
      const googleProvider = firebaseUser.providerData.find(p => p.providerId === 'google.com');
      if (googleProvider && (googleProvider as any).email) {
        userEmail = (googleProvider as any).email;
      }
    }
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Usuario Sin Nombre',
      email: userEmail || '',
      token,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      provider: 'google',
    };
  }
}