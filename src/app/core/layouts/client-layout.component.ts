import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../services/restaurant.service';
import { CustomerService } from '../services/customer.service';
import { AddressService } from '../services/address.service';
import { MenuService } from '../services/menu.service';
import { ProductService } from '../services/product.service';
import { MotorcycleService } from '../services/motorcycle.service';
import { OrderService } from '../services/order.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-client-layout',
  templateUrl: './client-layout.component.html',
  imports: [CommonModule, RouterOutlet, RouterModule, HttpClientModule],
  providers: [
    RestaurantService,
    CustomerService,
    AddressService,
    MenuService,
    ProductService,
    MotorcycleService,
    OrderService
  ]
})
export class ClientLayoutComponent implements OnInit {
  links = [
    { to: '/dashboard/client/orders', label: 'Pedidos' },
    { to: '/dashboard/client/cart', label: 'Carrito' },
    { to: '/dashboard/client/profile', label: 'Perfil' },
  ];

	constructor(
		private router: Router,
    private authService: AuthService,
	) {}

	ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.router.navigate(['/auth/signin']);
      }
    });
	}
}