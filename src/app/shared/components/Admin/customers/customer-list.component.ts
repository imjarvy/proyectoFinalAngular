import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../../../../core/services/customer.service';
import { Customer } from '../../../../core/models/customer.model';

@Component({
  standalone: true,
  selector: 'app-admin-customer-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);

  customers: Customer[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.fetchCustomers();
  }

  private fetchCustomers(): void {
    this.customerService.getAll().subscribe({
      next: data => {
        this.customers = data;
        this.loading = false;
        console.log('Clientes:', data);
      },
      error: err => {
        this.error = err?.message ?? 'Error al cargar clientes.';
        this.loading = false;
      },
    });
  }

  handleDelete(id: number): void {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return;
    }
    this.customerService.delete(id).subscribe({
      next: () => {
        this.customers = this.customers.filter(c => c.id !== id);
      },
      error: err => {
        this.error = err?.message ?? 'Error al eliminar cliente.';
      },
    });
  }
}