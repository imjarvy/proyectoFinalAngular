import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DriverService } from '../../../core/services/driver.service';
import { Driver } from '../../../core/models/driver.model';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-conductores-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ConductoresListComponent implements OnInit, OnDestroy {
  private driverService = inject(DriverService);
  private destroy$ = new Subject<void>();

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  items = signal<Driver[]>([]);

  // filtros
  q = signal<string>('');
  estado = signal<string>('');

  // paginación simple
  page = signal<number>(1);
  pageSize = signal<number>(10);

  filtered = computed(() => {
    const term = this.q().toLowerCase().trim();
    const est = this.estado();
    return this.items().filter(d => {
      const matchesTerm = !term ||
        d.nombre.toLowerCase().includes(term) ||
        d.cedula.toLowerCase().includes(term) ||
        d.telefono.toLowerCase().includes(term);
      const matchesEstado = !est || d.estado === est;
      return matchesTerm && matchesEstado;
    });
  });

  paginated = computed(() => {
    const p = this.page();
    const s = this.pageSize();
    const start = (p - 1) * s;
    return this.filtered().slice(start, start + s);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading.set(true);
    this.error.set(null);
    this.driverService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.items.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los conductores');
          this.loading.set(false);
        },
      });
  }

  onDelete(id: number): void {
    if (!confirm('¿Eliminar conductor?')) return;
    this.loading.set(true);
    this.driverService
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.fetch(),
        error: () => {
          this.loading.set(false);
          alert('No se pudo eliminar');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
