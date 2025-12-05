import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DriverService } from '../../core/services/driver.service';
import { MotorcycleService } from '../../core/services/motorcycle.service';
import { Driver } from '../../core/models/driver.model';
import { Motorcycle } from '../../core/models/motorcycle.model';

@Component({
  standalone: true,
  selector: 'app-driver-list',
  imports: [CommonModule],
  templateUrl: './driver-list.component.html',
  styleUrl: './driver-list.component.scss',
})
export class DriverListComponent {
  private driverService = inject(DriverService);
  private motorcycleService = inject(MotorcycleService);
  private router = inject(Router);

  drivers: Driver[] = [];
  motosById = new Map<number, Motorcycle>();
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;
    this.driverService.getAll().subscribe({
      next: (drivers) => {
        this.drivers = drivers;
        const motoIds = Array.from(new Set(drivers.map(d => d.motoId).filter((v): v is number => !!v)));
        if (motoIds.length) {
          // Fetch each motorcycle by id to display brand/plate
          motoIds.forEach(id => {
            this.motorcycleService.getById(id).subscribe({
              next: (m) => this.motosById.set(id, m),
              error: () => {},
            });
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar conductores';
        this.loading = false;
      }
    });
  }

  goNew() {
    this.router.navigate(['dashboard/driver/drivers/new']);
  }

  edit(d: Driver) {
    this.router.navigate(['dashboard/driver/drivers/new'], { queryParams: { id: d.id } });
  }

  remove(d: Driver) {
    if (!confirm(`¿Eliminar al conductor ${d.nombre}?`)) return;
    this.driverService.delete(d.id).subscribe({
      next: () => this.load(),
      error: () => this.error = 'No se pudo eliminar el conductor'
    });
  }
}
