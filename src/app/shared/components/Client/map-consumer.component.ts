import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MapService } from '../../../infrastructure/maps/map.service';
import { OrderService } from '../../../core/services/order.service';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  standalone: true,
  selector: 'app-map-consumer',
  imports: [CommonModule],
  templateUrl: './map-consumer.component.html',
  styleUrl: './map-consumer.component.scss',
})
export class MapConsumerComponent {
  private route = inject(ActivatedRoute);
  private mapService = inject(MapService);
  private orderService = inject(OrderService);
  private socketService = inject(SocketService);

  estadoRealtime: 'socket' | 'polling' | 'idle' = 'idle';
  pedidoId!: number;
  motoId!: number;
  rutaCoords: Array<[number, number]> = [];

  ngOnInit() {
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(this.pedidoId)) return;

    // Inicializar mapa y cargar pedido
    this.init();
  }

  async init() {
    await this.mapService.initMap('map');
    this.orderService.getById(this.pedidoId).subscribe({
      next: (order) => {
        const destLat = (order as any).address?.lat ?? 5.0689;
        const destLng = (order as any).address?.lng ?? -75.5174;
        this.mapService.addMarker(destLat, destLng, 'Destino', 'destino');
        this.mapService.setView(destLat, destLng, 13);

        this.motoId = (order as any).motorcycle_id ?? (order as any).motorcycleId;
        if (this.motoId) {
          this.mapService.addMarker(destLat, destLng, 'Destino', 'destino');
          // marcador de moto (posición inicial desconocida)
          this.mapService.addMarker(destLat, destLng, 'Moto', String(this.motoId));
        }

        // Intentar socket primero
        try {
          this.socketService.connect();
          this.estadoRealtime = 'socket';

          this.socketService.onUbicacionMoto().subscribe(evt => {
            if (evt.pedidoId !== this.pedidoId) return;
            this.mapService.updateMarkerPosition(String(evt.motoId), evt.lat, evt.lng);
            this.rutaCoords.push([evt.lat, evt.lng]);
            // dibujar polyline incremental
            this.mapService.drawRoute(String(this.pedidoId), this.rutaCoords);
          });

          this.socketService.onRutaPedido().subscribe(evt => {
            if (evt.pedidoId !== this.pedidoId) return;
            if (evt.geojson) this.mapService.drawRoute(String(this.pedidoId), evt.geojson);
            else if (evt.latlngs) this.mapService.drawRoute(String(this.pedidoId), evt.latlngs);
          });
        } catch {
          this.estadoRealtime = 'polling';
          // fallback a polling cada 5s (ejemplo con getById)
          const poll = () => {
            this.orderService.getById(this.pedidoId).subscribe({ next: (o) => { /* actualizar UI si hay coords */ } });
          };
          poll();
          setInterval(poll, 5000);
        }
      },
      error: () => {}
    });
  }
}
