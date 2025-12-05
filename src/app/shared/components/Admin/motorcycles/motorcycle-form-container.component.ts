import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MotorcycleService } from '../../../../core/services/motorcycle.service';
import { MotorcycleFormComponent, MotorcycleFormValues } from './motorcycle-form.component';

const initialValues: MotorcycleFormValues = {
  license_plate: '',
  brand: '',
  year: '',
  status: '',
};

@Component({
  standalone: true,
  selector: 'app-admin-motorcycle-form-container',
  imports: [CommonModule, MotorcycleFormComponent],
  template: `
    <p *ngIf="loading" class="text-center py-4">Cargando...</p>

    <app-admin-motorcycle-form
      *ngIf="!loading"
      [values]="values"
      [isEdit]="isEdit"
      (submitForm)="handleSubmit($event)"
    ></app-admin-motorcycle-form>
  `,
})
export class MotorcycleFormContainerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private motorcycleService = inject(MotorcycleService);

  id: number | null = null;
  isEdit = false;
  values: MotorcycleFormValues = { ...initialValues };
  loading = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;
    this.isEdit = !!this.id;

    if (this.isEdit && this.id) {
      this.loadMotorcycle(this.id);
    }
  }

  private loadMotorcycle(id: number): void {
    this.loading = true;
    this.motorcycleService.getById(id).subscribe({
      next: data => {
        this.values = {
          license_plate: data.license_plate,
          brand: data.brand,
          year: data.year,
          status: data.status,
        };
        this.loading = false;
      },
      error: () => {
        alert('Error al cargar motocicleta');
        this.loading = false;
      },
    });
  }

  handleSubmit(formValues: MotorcycleFormValues): void {
    this.loading = true;
    if (this.isEdit && this.id) {
      this.motorcycleService.update(this.id, formValues as any).subscribe({
        next: () => {
          alert('Motocicleta actualizada');
          this.router.navigate(['/dashboard/admin/motorcycles']);
        },
        error: () => {
          alert('Error al guardar la motocicleta');
          this.loading = false;
        },
      });
    } else {
      this.motorcycleService.create(formValues as any).subscribe({
        next: () => {
          alert('Motocicleta creada');
          this.router.navigate(['/dashboard/admin/motorcycles']);
        },
        error: () => {
          alert('Error al guardar la motocicleta');
          this.loading = false;
        },
      });
    }
  }
}
