import { Routes } from '@angular/router';
import { ClientLayoutComponent } from './core/layouts/client-layout.component';
import { OrdersComponent } from './shared/components/Client/orders.component';
import { CartComponent } from './shared/components/Client/cart.component';
import { ProfileComponent } from './shared/components/Client/profile.component';
import { MicrosoftAuthPageComponent } from './shared/components/auth/microsoft-auth-page.component';
import { SignInComponent } from './shared/components/auth/sign-in.component';

export const routes: Routes = [
		{
			path: 'auth/microsoft',
			component: MicrosoftAuthPageComponent,
		},
		{
			path: 'auth/signin',
			component: SignInComponent,
		},
	{
		path: 'dashboard/client',
		component: ClientLayoutComponent,
		children: [
			{ path: 'orders', component: OrdersComponent },
			{ path: 'cart', component: CartComponent },
			{ path: 'profile', component: ProfileComponent }
		]
	}
];
