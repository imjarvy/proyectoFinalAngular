import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MotorcycleService } from '../../../../core/services/motorcycle.service';
import { Motorcycle } from '../../../../core/models/motorcycle.model';

@Component({
  standalone: true,
  selector: 'app-admin-motorcycle-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './motorcycle-list.component.html',
})
export class MotorcycleListComponent implements OnInit {
  private motorcycleService = inject(MotorcycleService);
  private router = inject(Router);

  motorcycles: Motorcycle[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadMotorcycles();
  }

  private loadMotorcycles(): void {
    this.motorcycleService.getAll().subscribe({
      next: data => {
        this.motorcycles = data;
        this.loading = false;
      },
      error: () => {
        alert('Error al cargar motocicletas');
        this.loading = false;
      },
    });
  }

  goEdit(id: number): void {
    this.router.navigate(['/dashboard/admin/motorcycles/edit', id]);
  }

  handleDelete(id: number): void {
    if (!window.confirm('¿Eliminar esta moto?')) {
      return;
    }
    this.motorcycleService.delete(id).subscribe({
      next: () => {
        this.motorcycles = this.motorcycles.filter(m => m.id !== id);
      },
      error: () => {
        alert('Error eliminando la motocicleta');
      },
    });
  }
}
