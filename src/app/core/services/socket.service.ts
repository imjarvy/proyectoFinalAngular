import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// Servicio mínimo de sockets (placeholder) con API basada en Subjects.
// Si más adelante se integra socket.io-client, se puede reemplazar internamente
// manteniendo la misma interfaz pública.
@Injectable({ providedIn: 'root' })
export class SocketService {
  private conectado = false;
  private ubicacionMoto$ = new Subject<{ pedidoId: number; motoId: number; lat: number; lng: number; timestamp: number }>();
  private rutaPedido$ = new Subject<{ pedidoId: number; latlngs?: Array<[number, number]>; geojson?: any }>();

  connect() {
    // TODO: Integrar socket real. Por ahora, marcamos como conectado.
    this.conectado = true;
  }

  disconnect() {
    this.conectado = false;
  }

  isConnected() {
    return this.conectado;
  }

  onUbicacionMoto(): Observable<{ pedidoId: number; motoId: number; lat: number; lng: number; timestamp: number }> {
    return this.ubicacionMoto$.asObservable();
  }

  onRutaPedido(): Observable<{ pedidoId: number; latlngs?: Array<[number, number]>; geojson?: any }> {
    return this.rutaPedido$.asObservable();
  }

  // Métodos para inyectar datos (útiles si backend aún no emite sockets)
  emitUbicacion(data: { pedidoId: number; motoId: number; lat: number; lng: number; timestamp: number }) {
    this.ubicacionMoto$.next(data);
  }

  emitRuta(data: { pedidoId: number; latlngs?: Array<[number, number]>; geojson?: any }) {
    this.rutaPedido$.next(data);
  }
}
