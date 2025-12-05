import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantListComponent } from './restaurant-list.component';

@Component({
  standalone: true,
  selector: 'app-admin-restaurant-manager',
  imports: [CommonModule, RestaurantListComponent],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-4">Gestión de Restaurantes</h1>
      <app-admin-restaurant-list></app-admin-restaurant-list>
    </div>
  `
})
export class RestaurantManagerComponent {}
