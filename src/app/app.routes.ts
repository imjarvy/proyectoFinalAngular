import { Routes } from '@angular/router';
import { ClientLayoutComponent } from './core/layouts/client-layout.component';
import { AuthLayoutComponent } from './core/layouts/auth-layout.component';
import { AdminLayoutComponent } from './core/layouts/admin-layout.component';
import { OrdersComponent } from './shared/components/Client/orders.component';
import { CartComponent } from './shared/components/Client/cart.component';
import { ProfileComponent } from './shared/components/Client/profile.component';
import { MicrosoftAuthPageComponent } from './shared/components/auth/microsoft-auth-page.component';
import { SignInComponent } from './shared/components/auth/sign-in.component';
import { authGuard } from './core/guards/auth.guard';
import { RestaurantListComponent } from './shared/components/Admin/restaurants/restaurant-list.component';
import { RestaurantFormContainerComponent } from './shared/components/Admin/restaurants/restaurant-form-container.component';
import { MenuDetailComponent } from './shared/components/Admin/restaurants/menu-detail.component';
import { MotorcycleListComponent } from './shared/components/Admin/motorcycles/motorcycle-list.component';
import { MotorcycleFormContainerComponent } from './shared/components/Admin/motorcycles/motorcycle-form-container.component';
import { IssuesComponent } from './shared/components/Admin/issues/issues.component';
import { CustomerListComponent } from './shared/components/Admin/customers/customer-list.component';
import { CustomerFormContainerComponent } from './shared/components/Admin/customers/customer-form-container.component';
import { OrderManagerComponent } from './shared/components/Admin/Orders/order-manager.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/signin',
  },
  {
    path: 'auth/microsoft',
    component: MicrosoftAuthPageComponent,
  },
  {
    path: 'auth/signin',
    component: AuthLayoutComponent,
  },
  {
    path: 'dashboard/client',
    canActivate: [authGuard],
    component: ClientLayoutComponent,
    children: [
      { path: 'orders', component: OrdersComponent },
      { path: 'cart', component: CartComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
  {
    path: 'dashboard/admin',
    canActivate: [authGuard],
    component: AdminLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'restaurants' },
      { path: 'restaurants', component: RestaurantListComponent },
      { path: 'restaurants/new', component: RestaurantFormContainerComponent },
      { path: 'restaurants/edit/:id', component: RestaurantFormContainerComponent },
      { path: 'restaurants/menu/:id', component: MenuDetailComponent },

      { path: 'motorcycles', component: MotorcycleListComponent },
      { path: 'motorcycles/new', component: MotorcycleFormContainerComponent },
      { path: 'motorcycles/edit/:id', component: MotorcycleFormContainerComponent },

      { path: 'issues', component: IssuesComponent },

      { path: 'customers', component: CustomerListComponent },
      { path: 'customers/new', component: CustomerFormContainerComponent },
      { path: 'customers/edit/:id', component: CustomerFormContainerComponent },

      { path: 'orders', component: OrderManagerComponent },
    ],
  },
];
