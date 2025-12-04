import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  imports: [CommonModule, RouterOutlet, RouterModule, HttpClientModule]
})
export class AdminLayoutComponent {
  links = [
    { to: '/dashboard/admin/orders', label: 'Pedidos' },
    // Puedes agregar más enlaces aquí
  ];
}
