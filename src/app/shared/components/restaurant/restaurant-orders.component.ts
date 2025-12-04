import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { CustomerService } from '../../../core/services/customer.service';
import { MenuService } from '../../../core/services/menu.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-restaurant-orders',
  templateUrl: './restaurant-orders.component.html',
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [OrderService, CustomerService, MenuService]
})
export class RestaurantOrdersComponent implements OnInit {
  ESTADOS = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  orders: any[] = [];
  estadoFiltro: string = '';
  loading = true;
  error = '';
  customers: any[] = [];
  menus: any[] = [];

  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const [ordersData, customersData, menusData] = await Promise.all([
        this.orderService.getAll().toPromise(),
        this.customerService.getAll().toPromise(),
        this.menuService.getAll().toPromise(),
      ]);
      this.orders = ordersData ?? [];
      this.customers = customersData ?? [];
      this.menus = menusData ?? [];
    } catch (err) {
      this.error = 'Error cargando pedidos/datos';
    } finally {
      this.loading = false;
    }
  }

  getCustomerName(id: any): string {
    return this.customers.find((c: any) => c.id === id)?.name || id || '—';
  }

  getMenuName(id: any): string {
    const menu = this.menus.find((m: any) => m.id === id);
    // Si el menú tiene name directo o relaciona un producto
    return (
      menu?.name ||
      menu?.product?.name ||
      id ||
      '—'
    );
  }

  get pedidosFiltrados(): any[] {
    return this.estadoFiltro
      ? this.orders.filter(order => order.status === this.estadoFiltro)
      : this.orders;
  }

  setEstadoFiltro(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.estadoFiltro = target.value;
  }

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private menuService: MenuService
  ) {}
}