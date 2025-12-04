import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MicrosoftAuthService } from '../services/microsoft-auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
	const authService = inject(AuthService);
	const msAuth = inject(MicrosoftAuthService);
	const router = inject(Router);

	return authService.isAuthenticated$.pipe(
		take(1),
		map(isAuth => {
			const msState = msAuth.value;
			const isMicrosoftAuth = msState.isAuthenticated;
			const isAuthenticated = isAuth || isMicrosoftAuth;

			if (!isAuthenticated) {
				router.navigate(['/auth/signin']);
				return false;
			}
			return true;
		}),
	);
};

export default authGuard;
