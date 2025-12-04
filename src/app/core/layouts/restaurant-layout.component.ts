import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../services/restaurant.service';
import { OrderService } from '../services/order.service';
import { MenuService } from '../services/menu.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-restaurant-layout',
  templateUrl: './restaurant-layout.component.html',
  imports: [CommonModule, RouterOutlet, RouterModule, HttpClientModule],
  providers: [RestaurantService, OrderService, MenuService]
})
export class RestaurantLayoutComponent {
  links = [
    { to: '/dashboard/restaurant/orders', label: 'Pedidos' },
    // Puedes agregar más enlaces aquí
  ];
}
