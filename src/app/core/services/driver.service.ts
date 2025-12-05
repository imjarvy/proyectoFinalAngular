import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Driver, DriverCreatePayload } from '../models/driver.model';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/drivers`;

  getAll(params?: Record<string, any>): Observable<Driver[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get<any[]>(this.base, { params: httpParams }).pipe(
      map(list => list.map(this.fromApi))
    );
  }

  getById(id: number): Observable<Driver> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(this.fromApi));
  }

  create(payload: DriverCreatePayload): Observable<Driver> {
    // Map frontend payload to backend expected fields
    const apiPayload: any = {
      name: (payload as any).name || payload.nombre,
      license_number: (payload as any).license_number || payload.licencia?.numero,
      phone: (payload as any).phone || payload.telefono,
      email: (payload as any).email || '',
      status: (payload as any).status || 'available',
    };
    const motoId = (payload as any).motorcycle_id ?? (payload as any).motoId ?? payload.motoId;
    if (motoId !== undefined && motoId !== null) apiPayload.motorcycle_id = Number(motoId);
    return this.http.post<Driver>(this.base, apiPayload);
  }

  update(id: number, payload: Partial<DriverCreatePayload>): Observable<Driver> {
    const apiPayload: any = {
      // Map only provided fields
      ...(payload.nombre !== undefined ? { name: payload.nombre } : {}),
      ...(payload.telefono !== undefined ? { phone: payload.telefono } : {}),
      ...(payload.licencia?.numero !== undefined ? { license_number: payload.licencia.numero } : {}),
      ...(payload.motoId !== undefined ? { motorcycle_id: payload.motoId } : {}),
      ...(payload as any).status !== undefined ? { status: (payload as any).status } : {},
      ...(payload as any).email !== undefined ? { email: (payload as any).email } : {},
    };
    return this.http.put<any>(`${this.base}/${id}`, apiPayload).pipe(map(this.fromApi));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  assignMotorcycle(driverId: number, motoId: number): Observable<Driver> {
    // Fallback: usar PUT /drivers/:id con motorcycle_id si no existe endpoint dedicado
    return this.update(driverId, { motoId } as any);
  }

  uploadDocument(driverId: number, file: File): Observable<{ url: string }> {
    // Endpoint esperado: POST /drivers/:id/documents multipart/form-data
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/${driverId}/documents`, form);
  }

  private fromApi = (api: any): Driver => ({
    id: api.id,
    nombre: api.name ?? api.nombre ?? '',
    cedula: api.cedula ?? api.document ?? '',
    telefono: api.phone ?? api.telefono ?? '',
    licencia: {
      numero: api.license_number ?? api.licencia?.numero ?? '',
      tipo: api.licencia?.tipo ?? 'A',
      vencimiento: api.licencia?.vencimiento ?? new Date().toISOString(),
    },
    motoId: api.motorcycle_id ?? api.motoId ?? undefined,
    estado: api.status ?? 'activo',
    foto: api.foto ?? undefined,
    documentos: api.documentos ?? undefined,
    created_at: api.created_at ?? undefined,
  });
}
