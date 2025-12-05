import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { OrderFormComponent } from './order-form.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-order-form-container',
  templateUrl: './order-form-container.component.html',
  imports: [CommonModule, OrderFormComponent]
})
export class OrderFormContainerComponent implements OnChanges {
  @Input() order: any = null;
  @Input() customers: any[] = [];
  @Input() motorcycles: any[] = [];
  @Input() menus: any[] = [];
  @Input() products: any[] = [];

  @Output() submit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form: any = {
    customer_id: '',
    motorcycle_id: '',
    menu_id: '',
    quantity: 1,
    status: '',
    total_price: ''
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order']) {
      const o = this.order || {};
      this.form = {
        customer_id: o.customer_id || '',
        motorcycle_id: o.motorcycle_id || '',
        menu_id: o.menu_id || '',
        quantity: o.quantity || 1,
        status: o.status || '',
        total_price: o.total_price || ''
      };
    }
  }

  handleFormChange(nextForm: any): void {
    this.form = nextForm;
  }

  handleSubmit(form: any): void {
    this.submit.emit({
      customer_id: Number(form.customer_id),
      menu_id: Number(form.menu_id),
      motorcycle_id: form.motorcycle_id ? Number(form.motorcycle_id) : null,
      quantity: Number(form.quantity),
      status: form.status || 'pending',
    });
  }

  handleCancel(): void {
    this.cancel.emit();
  }
}