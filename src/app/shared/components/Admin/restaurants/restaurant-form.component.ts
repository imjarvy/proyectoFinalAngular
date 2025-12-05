import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RestaurantFormData {
  name: string;
  address: string;
  phone: string;
  email?: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-restaurant-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-form.component.html',
})
export class RestaurantFormComponent implements OnChanges {
  @Input() restaurantId?: number | string | null;
  @Input() initialData: RestaurantFormData | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() save = new EventEmitter<RestaurantFormData>();
  @Output() cancelClick = new EventEmitter<void>();

  formData: RestaurantFormData = {
    name: '',
    address: '',
    phone: '',
    email: '',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.formData = { ...this.initialData };
    }
  }

  onSubmit(): void {
    this.save.emit(this.formData);
  }

  cancel(): void {
    this.cancelClick.emit();
  }
}
