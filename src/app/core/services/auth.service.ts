import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { FirebaseAuthProviderService } from './firebase-auth-provider.service';
import { MicrosoftAuthService } from './microsoft-auth.service';
import { UserStorageManager } from '../utils/storage-manager';
import securityService from './security.service';
import { AuthUser } from '../models/auth.model';
import { MsalService } from '@azure/msal-angular';
import { CustomerService } from './customer.service';
import { firstValueFrom } from 'rxjs';

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
		private msal: MsalService,
		private customerService: CustomerService,
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

	// Sincroniza el usuario autenticado con el backend de clientes y guarda customerId en localStorage
	// Copia la lógica usada en React: buscar por email y solo crear si no existe.
	private async syncCustomerId(user: AuthUser): Promise<void> {
		try {
			const email = user.email;
			if (!email) {
				console.warn('syncCustomerId: usuario sin email, no se puede sincronizar');
				return;
			}

			// 1) Obtener todos los customers y buscar por email (igual que en React)
			const allCustomers = await firstValueFrom(this.customerService.getAll());
			const existing = (allCustomers ?? []).find((c: any) => c.email === email);

			let customer: any = existing;

			// 2) Si no existe, crearlo
			if (!customer) {
				const payload: any = {
					name: user.name || (user as any).displayName || 'Usuario',
					email,
					phone: '',
					provider: user.provider || (user as any).provider || 'firebase',
				};
				customer = await firstValueFrom(this.customerService.create(payload));
			}

			// 3) Si tenemos id, guardarlo en localStorage
			if (customer && customer.id != null) {
				localStorage.setItem('customerId', String(customer.id));
				console.log('customerId sincronizado con backend:', customer.id);
			} else {
				console.warn('syncCustomerId: customer sin id, no se pudo guardar customerId', customer);
			}
		} catch (e) {
			console.warn('No se pudo sincronizar customerId con backend (se continúa igual):', e);
			// Opcional: imitar comportamiento de React guardando datos temporales
			// localStorage.setItem('tempEmail', user.email || '');
			// localStorage.setItem('tempName', user.name || (user as any).displayName || 'Usuario');
		}
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
			// Sincronizar/crear Customer en backend y guardar customerId
			await this.syncCustomerId(result.user);
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
			// Sincronizar/crear Customer en backend y guardar customerId
			await this.syncCustomerId(result.user);
			this.state$.next({ user: result.user, loading: false });
		} catch (err) {
			console.error('Error en signInWithGithub:', err);
			this.setLoading(false);
			throw err;
		}
	}

	async signOut(): Promise<void> {
		this.setLoading(true);
		try {
			// 1) Firebase
			try {
				await this.firebaseAuth.signOut();
			} catch (err) {
				console.error('Error signOut Firebase:', err);
			}

			// 2) Backend propio (si existe)
			try {
				await (securityService as any).logout?.();
			} catch (e) {
				console.warn('Error cerrando sesión en backend (se continúa):', e);
			}

			// 3) Microsoft (MSAL)
			try {
				const accounts = this.msal.instance.getAllAccounts();
				if (accounts.length > 0) {
					await this.msal.logoutPopup({
						account: accounts[0],
					} as any);
				}
			} catch (e) {
				console.warn('Error cerrando sesión Microsoft (MSAL):', e);
			}

			// 4) Estado interno + storage
			this.msAuthState.logout();
			UserStorageManager.clearUser();
			this.state$.next({ user: null, loading: false });
		} finally {
			this.setLoading(false);
		}
	}
}
