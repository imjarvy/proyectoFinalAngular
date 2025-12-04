import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserStorageManager } from '../../../core/utils/storage-manager';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  customer: any = null;
  isEditing = false;
  formData = {
    name: '',
    email: '',
    phone: ''
  };

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Recuperar el usuario autenticado desde el storage unificado
    const user = UserStorageManager.getUser();
    if (!user || !user.id) {
      alert('Por favor inicia sesión para ver tu perfil');
      this.router.navigate(['/auth/signin']);
      return;
    }

    // Usar el id del usuario autenticado como customer_id para cargar el perfil
    this.loadCustomerData(Number(user.id));
  }

  loadCustomerData(id: number): void {
    this.customerService.getById(id).subscribe({
      next: (customerData) => {
        this.customer = customerData;
        this.formData = {...customerData};
      },
      error: (error) => {
        console.error('Error loading customer data:', error);
      }
    });
  }

  handleInputChange(event: any): void {
    const { name, value } = event.target;
    this.formData = { ...this.formData, [name]: value };
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    if (!this.customer) return;
    this.customerService.update(this.customer.id, this.formData).subscribe({
      next: () => {
        this.customer = { ...this.formData };
        this.isEditing = false;
      },
      error: (error) => {
        console.error('Error updating customer:', error);
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.formData = {...this.customer};
  }
}