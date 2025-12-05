import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CustomerFormData {
  id?: number;
  name: string;
  email: string;
  phone: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-customer-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-form.component.html',
})
export class CustomerFormComponent implements OnChanges {
  @Input() initialData: Partial<CustomerFormData> = {};
  @Input() loading = false;
  @Output() save = new EventEmitter<CustomerFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: CustomerFormData = {
    name: '',
    email: '',
    phone: '',
  };

  errors: { name?: string; email?: string; phone?: string } = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData']) {
      this.formData = {
        ...this.formData,
        ...this.initialData,
      } as CustomerFormData;
    }
  }

  private validate(): boolean {
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    if (!this.formData.name) newErrors['name'] = 'El nombre es obligatorio';
    if (!this.formData.email) newErrors['email'] = 'El email es obligatorio';
    if (!this.formData.phone) newErrors['phone'] = 'El teléfono es obligatorio';
    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) return;
    this.save.emit(this.formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
