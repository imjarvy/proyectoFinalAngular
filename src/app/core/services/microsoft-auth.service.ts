/**
 * Servicio que mantiene el estado de autenticación de Microsoft.
 * Sustituye al slice Redux: guarda isAuthenticated, user, photo, accessToken, loading, error.
 * Expone observables/behaviorsubjects para que componentes se suscriban.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MicrosoftUser } from './microsoft-graph.service';

interface MicrosoftAuthState {
  isAuthenticated: boolean;
  user: MicrosoftUser | null;
  photo: string | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class MicrosoftAuthService {
  private state$ = new BehaviorSubject<MicrosoftAuthState>({
    isAuthenticated: false,
    user: null,
    photo: null,
    accessToken: null,
    loading: false,
    error: null,
  });

  state = this.state$.asObservable();

  get value(): MicrosoftAuthState {
    return this.state$.getValue();
  }

  setAuthenticated(v: boolean): void {
    this.state$.next({ ...this.value, isAuthenticated: v });
  }

  setUserData(user: MicrosoftUser | null): void {
    this.state$.next({ ...this.value, user });
  }

  setUserPhoto(photo: string | null): void {
    this.state$.next({ ...this.value, photo });
  }

  setAccessToken(token: string | null): void {
    this.state$.next({ ...this.value, accessToken: token });
  }

  setLoading(loading: boolean): void {
    this.state$.next({ ...this.value, loading });
  }

  setError(error: string | null): void {
    this.state$.next({ ...this.value, error });
  }

  logout(): void {
    this.state$.next({
      isAuthenticated: false,
      user: null,
      photo: null,
      accessToken: null,
      loading: false,
      error: null,
    });
  }
}