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
  private readonly STORAGE_KEY = 'ms_auth_state_v1';

  private state$ = new BehaviorSubject<MicrosoftAuthState>(this.loadInitialState());

  state = this.state$.asObservable();

  get value(): MicrosoftAuthState {
    return this.state$.getValue();
  }

  private loadInitialState(): MicrosoftAuthState {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        return {
          isAuthenticated: false,
          user: null,
          photo: null,
          accessToken: null,
          loading: false,
          error: null,
        };
      }
      const parsed = JSON.parse(raw) as MicrosoftAuthState;
      return {
        ...parsed,
        loading: false,
        error: null,
      };
    } catch {
      return {
        isAuthenticated: false,
        user: null,
        photo: null,
        accessToken: null,
        loading: false,
        error: null,
      };
    }
  }

  private persist(next: MicrosoftAuthState): void {
    try {
      const toStore: MicrosoftAuthState = {
        ...next,
        loading: false,
        error: null,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // si localStorage falla, simplemente no persistimos
    }
  }

  setAuthenticated(v: boolean): void {
    const next = { ...this.value, isAuthenticated: v };
    this.state$.next(next);
    this.persist(next);
  }

  setUserData(user: MicrosoftUser | null): void {
    const next = { ...this.value, user };
    this.state$.next(next);
    this.persist(next);
  }

  setUserPhoto(photo: string | null): void {
    const next = { ...this.value, photo };
    this.state$.next(next);
    this.persist(next);
  }

  setAccessToken(token: string | null): void {
    const next = { ...this.value, accessToken: token };
    this.state$.next(next);
    this.persist(next);
  }

  setLoading(loading: boolean): void {
    const next = { ...this.value, loading };
    this.state$.next(next);
  }

  setError(error: string | null): void {
    const next = { ...this.value, error };
    this.state$.next(next);
  }

  logout(): void {
    const next: MicrosoftAuthState = {
      isAuthenticated: false,
      user: null,
      photo: null,
      accessToken: null,
      loading: false,
      error: null,
    };
    this.state$.next(next);
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // ignorar errores de storage
    }
  }
}