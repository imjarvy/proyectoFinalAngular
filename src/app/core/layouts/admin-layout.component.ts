import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SlideBar } from '../../shared/components/slide-bar/slide-bar';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  imports: [CommonModule, RouterOutlet, RouterModule, HttpClientModule, SlideBar]
})
export class AdminLayoutComponent {
  links = [
    { route: '/dashboard/admin/orders', label: 'Pedidos' },
    { route: '/dashboard/admin/restaurants', label: 'Restaurantes' },
    { route: '/dashboard/admin/customers',  label: 'Clientes' },
    { route: '/dashboard/admin/motorcycles', label: 'Motos' },
    { route: '/dashboard/admin/issues', label: 'Incidencias' }
  ];

  sidebarOpen = false;
  sidebarMobile = false;

  onSidebarStateChange(state: { isOpen: boolean; isMobile: boolean }): void {
    this.sidebarOpen = state.isOpen;
    this.sidebarMobile = state.isMobile;
  }
}