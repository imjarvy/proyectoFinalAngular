import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../../../../core/services/restaurant.service';
import { Restaurant } from '../../../../core/models/restaurant.model';

@Component({
  standalone: true,
  selector: 'app-admin-restaurant-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-list.component.html',
})
export class RestaurantListComponent implements OnInit {
  private restaurantService = inject(RestaurantService);

  restaurants: Restaurant[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  private fetchRestaurants(): void {
    this.restaurantService.getAll().subscribe({
      next: data => {
        this.restaurants = data;
        this.loading = false;
      },
      error: err => {
        this.error = err?.message ?? 'Error al cargar restaurantes.';
        this.loading = false;
      },
    });
  }

  handleDelete(id: number): void {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este restaurante?')) {
      return;
    }

    this.restaurantService.delete(id).subscribe({
      next: () => {
        this.restaurants = this.restaurants.filter(r => r.id !== id);
      },
      error: err => {
        this.error = err?.message ?? 'Error al eliminar restaurante.';
      },
    });
  }
}
