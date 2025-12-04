/**
 * UserStorageManager trasladado a TypeScript/Angular.
 * Misma API (saveUser, getUser, getSession, clearUser, updateUser, hasValidUser, debugInfo).
 */

import { AuthUser } from '../models/auth.model';

export class UserStorageManager {
  private static readonly USER_KEY = 'user';
  private static readonly SESSION_KEY = 'session';

  static saveUser(user: AuthUser, token?: string): void {
    try {
      const userToStore = {
        id: user.id,
        email: user.email,
        name: (user as any).name || (user as any).displayName || '',
        displayName: (user as any).displayName || (user as any).name || '',
        photoURL: (user as any).photoURL || null,
        provider: user.provider || (user as any).provider,
        token: token || user.token,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(userToStore));
      if (token) {
        localStorage.setItem(this.SESSION_KEY, token);
      }
      console.log(' Usuario guardado en localStorage:', userToStore);
    } catch (error) {
      console.error(' Error guardando usuario en localStorage:', error);
    }
  }

  static getUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (!userData) return null;
      const user = JSON.parse(userData);
      console.log(' Usuario leído desde localStorage:', user);
      return user as AuthUser;
    } catch (error) {
      console.error(' Error leyendo usuario desde localStorage:', error);
      return null;
    }
  }

  static getSession(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  static clearUser(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.SESSION_KEY);
      console.log('🧹 Usuario eliminado de localStorage');
    } catch (error) {
      console.error(' Error limpiando localStorage:', error);
    }
  }

  static updateUser(updates: Partial<AuthUser>): void {
    try {
      const currentUser = this.getUser();
      if (!currentUser) {
        console.warn(' No hay usuario para actualizar');
        return;
      }
      const updatedUser = { ...currentUser, ...updates };
      this.saveUser(updatedUser);
    } catch (error) {
      console.error(' Error actualizando usuario:', error);
    }
  }

  static hasValidUser(): boolean {
    const user = this.getUser();
    return !!(user && user.email);
  }

  static debugInfo(): void {
    console.log(' Debug LocalStorage:', {
      user: localStorage.getItem(this.USER_KEY),
      session: localStorage.getItem(this.SESSION_KEY),
      hasValidUser: this.hasValidUser(),
      timestamp: new Date().toISOString(),
    });
  }
}