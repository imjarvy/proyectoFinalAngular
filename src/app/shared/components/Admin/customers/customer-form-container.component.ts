import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../../core/services/customer.service';
import { Customer } from '../../../../core/models/customer.model';
import { CustomerFormComponent, CustomerFormData } from './customer-form.component';

@Component({
  standalone: true,
  selector: 'app-admin-customer-form-container',
  imports: [CommonModule, CustomerFormComponent],
  template: `
    <div *ngIf="fetching">Cargando...</div>
    <div *ngIf="error" class="text-red-500">{{ error }}</div>

    <app-admin-customer-form
      *ngIf="!fetching && !error"
      [initialData]="initialData"
      [loading]="loading"
      (save)="handleSave($event)"
      (cancel)="handleCancel()"
    ></app-admin-customer-form>
  `,
})
export class CustomerFormContainerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);

  id: number | null = null;
  initialData: Partial<CustomerFormData> = {};
  loading = false;
  fetching = false;
  error: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    if (this.id) {
      this.fetching = true;
      this.customerService.getById(this.id).subscribe({
        next: (data: Customer) => {
          this.initialData = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
          };
          this.fetching = false;
        },
        error: () => {
          this.error = 'No se pudo cargar el cliente.';
          this.fetching = false;
        },
      });
    }
  }

  handleSave(data: CustomerFormData): void {
    this.loading = true;
    if (this.id) {
      this.customerService.update(this.id, data as any).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/admin/customers']);
        },
        error: () => {
          this.error = 'Error al guardar el cliente.';
          this.loading = false;
        },
      });
    } else {
      this.customerService.create(data as any).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/admin/customers']);
        },
        error: () => {
          this.error = 'Error al guardar el cliente.';
          this.loading = false;
        },
      });
    }
  }

  handleCancel(): void {
    this.router.navigate(['/dashboard/admin/customers']);
  }
}
