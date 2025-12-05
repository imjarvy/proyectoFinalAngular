import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MotorcycleService } from '../../core/services/motorcycle.service';
import { DriverService } from '../../core/services/driver.service';
import { Motorcycle } from '../../core/models/motorcycle.model';
import { Driver } from '../../core/models/driver.model';

@Component({
  standalone: true,
  selector: 'app-driver-moto',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './moto.component.html',
  styleUrl: './moto.component.scss',
})
export class DriverMotoComponent {
  private fb = inject(FormBuilder);
  private motorcycleService = inject(MotorcycleService);
  private driverService = inject(DriverService);

  drivers: Driver[] = [];
  driverId: number | null = null;

  motos: Motorcycle[] = [];
  assignedMoto: Motorcycle | null = null;
  loading = true;
  error: string | null = null;
  success: string | null = null;

  form = this.fb.group({
    driverId: [null as number | null, [Validators.required]],
    motoId: [null as number | null, [Validators.required]],
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;
    this.success = null;
    // Obtener lista de conductores
    this.driverService.getAll().subscribe({
      next: (drivers) => { this.drivers = drivers; if (drivers.length) { this.driverId = drivers[0].id; this.form.patchValue({ driverId: this.driverId }); } },
      error: () => {}
    });

    // Obtener motos disponibles
    this.motorcycleService.getAll().subscribe({
      next: (motos) => {
        this.motos = motos;
        // Obtener el conductor para conocer su moto asignada
        const selectedDriverId = Number(this.form.value.driverId ?? this.driverId);
        if (!selectedDriverId) { this.loading = false; return; }
        this.driverService.getById(selectedDriverId).subscribe({
          next: (driver) => {
            const motoId = Number(driver.motoId);
            if (Number.isFinite(motoId) && motoId > 0) {
              this.motorcycleService.getById(motoId).subscribe({
                next: (m) => { this.assignedMoto = m; this.loading = false; },
                error: () => { this.assignedMoto = null; this.loading = false; }
              });
            } else {
              this.assignedMoto = null;
              this.loading = false;
            }
          },
          error: () => { this.error = 'No se pudo cargar el conductor'; this.loading = false; }
        });
      },
      error: () => { this.error = 'No se pudieron cargar las motos'; this.loading = false; }
    });
  }

  assignMoto() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const drvId = Number(this.form.value.driverId);
    if (!drvId) { this.error = 'Selecciona un conductor'; return; }
    const id = Number(this.form.value.motoId);
    this.driverService.assignMotorcycle(drvId, id).subscribe({
      next: (driver) => {
        this.success = 'Moto asignada correctamente';
        this.error = null;
        const motoId = Number(driver.motoId);
        if (Number.isFinite(motoId) && motoId > 0) {
          this.motorcycleService.getById(motoId).subscribe({
          next: (m) => this.assignedMoto = m,
          error: () => {}
          });
        } else {
          this.assignedMoto = null;
        }
      },
      error: () => {
        this.error = 'No se pudo asignar la moto';
        this.success = null;
      }
    });
  }
}
