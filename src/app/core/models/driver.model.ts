export type DriverEstado = 'activo' | 'inactivo' | 'suspendido';

export interface DriverLicencia {
  numero: string;
  tipo: string;
  vencimiento: string | Date; // ISO string o Date
}

export interface Driver {
  id: number;
  nombre: string;
  cedula: string; // documento
  telefono: string;
  licencia: DriverLicencia;
  motoId?: number; // motorcycleId asignada
  estado: DriverEstado; // activo/inactivo/suspendido
  foto?: string;
  documentos?: string[];
  created_at?: string | Date; // fecha de creación
}

export interface DriverCreatePayload {
  nombre: string;
  cedula: string;
  telefono: string;
  licencia: DriverLicencia;
  motoId?: number;
  estado?: DriverEstado;
  foto?: string;
  documentos?: string[];
}
