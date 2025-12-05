import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RestaurantService } from '../../../../core/services/restaurant.service';
import { RestaurantFormComponent, RestaurantFormData } from './restaurant-form.component';
import { Restaurant } from '../../../../core/models/restaurant.model';

@Component({
  standalone: true,
  selector: 'app-admin-restaurant-form-container',
  imports: [CommonModule, RestaurantFormComponent],
  template: `
    <app-admin-restaurant-form
      [restaurantId]="restaurantId"
      [initialData]="initialData"
      [loading]="loading"
      [error]="error"
      (save)="handleSave($event)"
      (cancelClick)="handleCancel()"
    ></app-admin-restaurant-form>
  `,
})
export class RestaurantFormContainerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);

  restaurantId: number | null = null;
  initialData: RestaurantFormData | null = null;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.restaurantId = idParam ? Number(idParam) : null;

    if (this.restaurantId) {
      this.fetchRestaurant(this.restaurantId);
    }
  }

  private fetchRestaurant(id: number): void {
    this.loading = true;
    this.restaurantService.getById(id).subscribe({
      next: (data: Restaurant) => {
        this.initialData = {
          name: data.name ?? '',
          address: (data as any).address ?? '',
          phone: (data as any).phone ?? '',
          email: (data as any).email ?? '',
        };
        this.loading = false;
      },
      error: err => {
        this.error = err?.message ?? 'No se pudo cargar el restaurante.';
        this.loading = false;
      },
    });
  }

  handleSave(data: RestaurantFormData): void {
    if (this.restaurantId) {
      this.updateRestaurant(this.restaurantId, data);
    } else {
      this.createRestaurant(data);
    }
  }

  private createRestaurant(data: RestaurantFormData): void {
    this.loading = true;
    this.error = null;
    this.restaurantService.create(data as any).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard/admin/restaurants']);
      },
      error: err => {
        this.error = err?.message ?? 'Error al guardar el restaurante.';
        this.loading = false;
      },
    });
  }

  private updateRestaurant(id: number, data: RestaurantFormData): void {
    this.loading = true;
    this.error = null;
    this.restaurantService.update(id, data as any).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard/admin/restaurants']);
      },
      error: err => {
        this.error = err?.message ?? 'Error al guardar el restaurante.';
        this.loading = false;
      },
    });
  }

  handleCancel(): void {
    this.router.navigate(['/dashboard/admin/restaurants']);
  }
}
