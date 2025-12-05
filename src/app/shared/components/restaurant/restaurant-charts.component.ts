import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Chart } from 'chart.js/auto';

import { CustomerService } from '../../../core/services/customer.service';
import { OrderService } from '../../../core/services/order.service';
import { MenuService } from '../../../core/services/menu.service';
import { Menu } from '../../../core/models/menu.model';
import { Order } from '../../../core/models/order.model';

@Component({
  standalone: true,
  selector: 'app-restaurant-charts',
  templateUrl: './restaurant-charts.component.html',
  imports: [CommonModule, HttpClientModule],
  providers: [CustomerService, OrderService, MenuService],
})
export class RestaurantChartsComponent implements OnInit {
  loading = true;
  error = '';

  barCharts: any[] | null = null;
  doughnutCharts: any[] | null = null;
  lineCharts: any[] | null = null;

  constructor(
    private customerService: CustomerService,
    private orderService: OrderService,
    private menuService: MenuService,
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const [orders, customers, menus] = await Promise.all([
        this.orderService.getAll().toPromise(),
        this.customerService.getAll().toPromise(),
        this.menuService.getAll().toPromise(),
      ]);

      const safeOrders = (Array.isArray(orders) ? orders : []) as Order[];
      const safeCustomers = Array.isArray(customers) ? customers : [];
      const safeMenus = (Array.isArray(menus) ? menus : []) as Menu[];

      // ----- BARRAS -----
      const ventasPorClienteMapa = new Map<number, number>();
      for (const o of safeOrders) {
        const key = o.customer_id as number;
        const prev = ventasPorClienteMapa.get(key) ?? 0;
        ventasPorClienteMapa.set(key, prev + (o.total_price ?? 0));
      }
      const barras1 = Array.from(ventasPorClienteMapa.entries()).map(
        ([customerId, ventas]) => {
          const c = safeCustomers.find((x: any) => x.id === customerId);
          return { name: c?.name ?? String(customerId), ventas };
        },
      );

      const ventasPorMenuMapa = new Map<number, number>();
      for (const o of safeOrders) {
        const key = o.menu_id as number;
        const prev = ventasPorMenuMapa.get(key) ?? 0;
        ventasPorMenuMapa.set(key, prev + (o.total_price ?? 0));
      }
      const barras2 = Array.from(ventasPorMenuMapa.entries()).map(
        ([menuId, ventas]) => {
          const m = safeMenus.find((x) => x.id === menuId);
          return { name: m ? `Menú ${m.id}` : String(menuId), ventas };
        },
      );

      const ventasPorEstadoMapa = new Map<string, number>();
      for (const o of safeOrders) {
        const key = (o.status as string) ?? 'desconocido';
        const prev = ventasPorEstadoMapa.get(key) ?? 0;
        ventasPorEstadoMapa.set(key, prev + (o.total_price ?? 0));
      }
      const barras3 = Array.from(ventasPorEstadoMapa.entries()).map(
        ([status, ventas]) => ({ name: status, ventas }),
      );

      this.barCharts = [
        {
          labels: barras1.map((x) => x.name),
          datasets: [
            {
              label: 'Ventas por cliente',
              data: barras1.map((x) => x.ventas),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
          ],
        },
        {
          labels: barras2.map((x) => x.name),
          datasets: [
            {
              label: 'Ventas por menú',
              data: barras2.map((x) => x.ventas),
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
          ],
        },
        {
          labels: barras3.map((x) => x.name),
          datasets: [
            {
              label: 'Ventas por estado',
              data: barras3.map((x) => x.ventas),
              backgroundColor: 'rgba(255, 206, 86, 0.5)',
            },
          ],
        },
      ];

      // ----- CIRCULARES -----
      const pedidosPorEstadoMapa = new Map<string, number>();
      for (const o of safeOrders) {
        const key = (o.status as string) ?? 'desconocido';
        const prev = pedidosPorEstadoMapa.get(key) ?? 0;
        pedidosPorEstadoMapa.set(key, prev + 1);
      }
      const circulares = Array.from(pedidosPorEstadoMapa.entries()).map(
        ([categoria, pedidos]) => ({ categoria, pedidos }),
      );

      this.doughnutCharts = [
        {
          labels: circulares.map((x) => x.categoria),
          datasets: [
            {
              label: 'Pedidos por estado',
              data: circulares.map((x) => x.pedidos),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
              ],
            },
          ],
        },
      ];

      // ----- SERIES -----
      const pedidosPorFechaMapa = new Map<string, number>();
      for (const o of safeOrders) {
        const raw = o.created_at;
        if (!raw) continue;
        const fecha = String(raw).slice(0, 10);
        const prev = pedidosPorFechaMapa.get(fecha) ?? 0;
        pedidosPorFechaMapa.set(fecha, prev + 1);
      }
      const series1 = Array.from(pedidosPorFechaMapa.entries())
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([fecha, pedidos]) => ({ fecha, pedidos }));

      this.lineCharts = [
        {
          labels: series1.map((x) => x.fecha),
          datasets: [
            {
              label: 'Pedidos en el tiempo',
              data: series1.map((x) => x.pedidos),
              fill: false,
              borderColor: 'rgba(75, 192, 192, 1)',
              tension: 0.1,
            },
          ],
        },
      ];

      // Renderizar las gráficas una vez que los datos están listos
      setTimeout(() => {
        this.renderCharts();
      });
    } catch (err) {
      console.error(err);
      this.error = 'Error al cargar los datos de las gráficas';
    } finally {
      this.loading = false;
    }
  }

  private renderCharts(): void {
    if (this.barCharts) {
      this.barCharts.forEach((data, idx) => {
        const canvas = document.getElementById('barChart' + idx) as HTMLCanvasElement | null;
        if (canvas) {
          new Chart(canvas, {
            type: 'bar',
            data,
            options: {
              responsive: true,
              maintainAspectRatio: false,
            },
          });
        }
      });
    }

    if (this.doughnutCharts) {
      this.doughnutCharts.forEach((data, idx) => {
        const canvas = document.getElementById('doughnutChart' + idx) as HTMLCanvasElement | null;
        if (canvas) {
          new Chart(canvas, {
            type: 'doughnut',
            data,
            options: {
              responsive: true,
              maintainAspectRatio: false,
            },
          });
        }
      });
    }

    if (this.lineCharts) {
      this.lineCharts.forEach((data, idx) => {
        const canvas = document.getElementById('lineChart' + idx) as HTMLCanvasElement | null;
        if (canvas) {
          new Chart(canvas, {
            type: 'line',
            data,
            options: {
              responsive: true,
              maintainAspectRatio: false,
            },
          });
        }
      });
    }
  }
}