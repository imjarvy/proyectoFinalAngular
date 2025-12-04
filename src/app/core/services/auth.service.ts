import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { FirebaseAuthProviderService } from './firebase-auth-provider.service';
import { MicrosoftAuthService } from './microsoft-auth.service';
import { UserStorageManager } from '../utils/storage-manager';
import securityService from './security.service';
import { AuthUser } from '../models/auth.model';

interface AuthState {
	user: AuthUser | null;
	loading: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	private state$ = new BehaviorSubject<AuthState>({ user: null, loading: false });

	// Observables públicos
	readonly user$: Observable<AuthUser | null> = this.state$.asObservable().pipe(map(s => s.user));
	readonly loading$: Observable<boolean> = this.state$.asObservable().pipe(map(s => s.loading));
	readonly isAuthenticated$: Observable<boolean> = this.user$.pipe(map(u => !!u));

	constructor(
		private firebaseAuth: FirebaseAuthProviderService,
		private msAuthState: MicrosoftAuthService,
	) {
		// Inicializar desde localStorage / MSAL state
		this.bootstrapFromStorageAndMsal();
	}

	private bootstrapFromStorageAndMsal(): void {
		this.setLoading(true);
		const storedUser = UserStorageManager.getUser();
		if (storedUser) {
			this.state$.next({ user: storedUser, loading: false });
			return;
		}

		// Si no hay usuario en storage, miramos MSAL state
		const ms = this.msAuthState.value;
		if (ms.isAuthenticated && ms.user) {
			const authUser: AuthUser = {
				id: ms.user.id,
				name: ms.user.displayName,
				email: ms.user.mail || ms.user.userPrincipalName,
				photoURL: null,
				provider: 'microsoft',
				token: ms.accessToken,
			};
			UserStorageManager.saveUser(authUser, ms.accessToken || undefined);
			this.state$.next({ user: authUser, loading: false });
			return;
		}

		this.setLoading(false);
	}

	private setLoading(v: boolean): void {
		const current = this.state$.getValue();
		this.state$.next({ ...current, loading: v });
	}

	async signInWithGoogle(): Promise<void> {
		this.setLoading(true);
		try {
			const result = await this.firebaseAuth.signIn();
			UserStorageManager.saveUser(result.user, result.token);
			try {
				await (securityService as any).loginWithFirebase?.(result.user);
			} catch (e) {
				console.warn('Error integrando Google con backend (se continúa igual):', e);
			}
			this.state$.next({ user: result.user, loading: false });
		} catch (err) {
			console.error('Error en signInWithGoogle:', err);
			this.setLoading(false);
			throw err;
		}
	}

	async signInWithGithub(): Promise<void> {
		this.setLoading(true);
		try {
			const result = await this.firebaseAuth.signInWithGithub();
			UserStorageManager.saveUser(result.user, result.token);
			try {
				await (securityService as any).loginWithFirebase?.(result.user);
			} catch (e) {
				console.warn('Error integrando GitHub con backend (se continúa igual):', e);
			}
			this.state$.next({ user: result.user, loading: false });
		} catch (err) {
			console.error('Error en signInWithGithub:', err);
			this.setLoading(false);
			throw err;
		}
	}

	signOut(): void {
		this.firebaseAuth.signOut().catch(err => console.error('Error signOut Firebase:', err));
		(securityService as any).logout?.();
		UserStorageManager.clearUser();
		this.state$.next({ user: null, loading: false });
	}
}
