import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/orders`;

  constructor(private notificationService: NotificationService) {}

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.base);
  }

  getById(id: number | undefined): Observable<Order> {
    if (id == null) {
      throw new Error('OrderService.getById: id es requerido');
    }
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  create(data: Omit<Order, 'id' | 'created_at' | 'address' | 'customer' | 'menu'>): Observable<Order> {
    return new Observable<Order>((subscriber) => {
      this.http.post<Order>(this.base, data).subscribe({
        next: (res) => {
          // Notificación al crear pedido (equivalente a notify(...) en React)
          this.notificationService.notify({
            message:
              '¡Muchas gracias por tu compra! En breve contactaremos al restaurante para preparar tu pedido. ¡Estamos emocionados de atenderte!',
            type: 'success',
          });
          subscriber.next(res);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    });
  }

  update(id: number | undefined, data: Partial<Order>): Observable<Order> {
    if (id == null) {
      throw new Error('OrderService.update: id es requerido');
    }

    return new Observable<Order>((subscriber) => {
      // Obtener el pedido anterior para comparar el estado
      this.getById(id).subscribe({
        next: (prev) => {
          const prevStatus = prev.status;
          this.http.put<Order>(`${this.base}/${id}`, data).subscribe({
            next: (res) => {
              const newStatus = data.status;
              if (newStatus && prevStatus !== newStatus) {
                if (prevStatus === 'pending' && newStatus === 'in_progress') {
                  this.notificationService.notify({
                    message:
                      '¡Tu pedido ha sido confirmado por el restaurante! Muy pronto llegará a tus manos. ¡Gracias por confiar en nosotros!',
                    type: 'info',
                  });
                } else if (prevStatus === 'in_progress' && newStatus === 'delivered') {
                  this.notificationService.notify({
                    message:
                      '¡Tu pedido ha llegado! Esperamos que lo disfrutes muchísimo. ¡Buen provecho!',
                    type: 'success',
                  });
                } else if (newStatus === 'cancelled') {
                  this.notificationService.notify({
                    message:
                      'Lamentamos mucho lo sucedido con tu pedido. Esperamos verte pronto para poder brindarte una mejor experiencia.',
                    type: 'error',
                  });
                }
              }
              subscriber.next(res);
              subscriber.complete();
            },
            error: (err) => subscriber.error(err),
          });
        },
        error: (err) => subscriber.error(err),
      });
    });
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}