import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MotorcycleFormValues {
  license_plate: string;
  brand: string;
  year: number | string;
  status: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-motorcycle-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './motorcycle-form.component.html',
})
export class MotorcycleFormComponent {
  @Input() values: MotorcycleFormValues = {
    license_plate: '',
    brand: '',
    year: '',
    status: '',
  };
  @Input() isEdit = false;
  @Output() submitForm = new EventEmitter<MotorcycleFormValues>();

  currentYear = new Date().getFullYear();

  submit(): void {
    this.submitForm.emit(this.values);
  }
}
