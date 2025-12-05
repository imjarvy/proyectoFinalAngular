import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DriverService } from '../../../core/services/driver.service';
import { Driver } from '../../../core/models/driver.model';
import { MotorcycleService } from '../../../core/services/motorcycle.service';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-conductores-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class ConductoresDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private driverService = inject(DriverService);
  private motorcycleService = inject(MotorcycleService);
  private destroy$ = new Subject<void>();

  id!: number;
  driver: Driver | null = null;
  loading = false;
  error: string | null = null;

  availableMotos: { id: number; license_plate: string }[] = [];
  selectedMoto: number | '' = '';

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.driverService
      .getById(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d) => {
          this.driver = d;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo cargar el conductor';
          this.loading = false;
        },
      });
  }

  openAssignModal(): void {
    this.motorcycleService
      .getAvailable()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list: any) => {
          this.availableMotos = list;
        },
        error: () => alert('No se pudieron cargar motos disponibles'),
      });
  }

  assign(): void {
    if (!this.selectedMoto || !this.driver) return;
    this.driverService
      .assignMotorcycle(this.driver.id, Number(this.selectedMoto))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d) => {
          this.driver = d;
          alert('Moto asignada');
        },
        error: () => alert('No se pudo asignar la moto'),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
