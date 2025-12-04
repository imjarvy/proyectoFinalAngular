import { AdminLayoutComponent } from './core/layouts/admin-layout.component';
import { OrderManagerComponent } from './shared/components/Admin/Orders/order-manager.component';
import { Routes } from '@angular/router';
import { OrdersComponent } from './shared/components/Client/orders.component';
import { CartComponent } from './shared/components/Client/cart.component';
import { ProfileComponent } from './shared/components/Client/profile.component';

import { RestaurantOrdersComponent } from './shared/components/restaurant/restaurant-orders.component';
import { ClientLayoutComponent } from './core/layouts/client-layout.component';
import { RestaurantLayoutComponent } from './core/layouts/restaurant-layout.component';

export const routes: Routes = [
		{
			path: 'dashboard/admin',
			component: AdminLayoutComponent,
			children: [
				{ path: 'orders', component: OrderManagerComponent }
			]
		},
	{
		path: 'dashboard/client',
		component: ClientLayoutComponent,
		children: [
			{ path: 'orders', component: OrdersComponent },
			{ path: 'cart', component: CartComponent },
			{ path: 'profile', component: ProfileComponent }
		]
	},
	{
		path: 'dashboard/restaurant',
		component: RestaurantLayoutComponent,
		children: [
			{ path: 'orders', component: RestaurantOrdersComponent }
		]
	}
];
