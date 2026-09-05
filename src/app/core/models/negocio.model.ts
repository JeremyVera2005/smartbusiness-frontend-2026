export type TipoNegocio = 'BODEGA' | 'FERRETERIA' | 'FARMACIA';
export type TamanoNegocio = 'PEQUENO' | 'MEDIANO' | 'GRANDE';
export type RolNegocio = 'DUENO' | 'EMPLEADO';

export const TIPOS_NEGOCIO: { value: TipoNegocio; label: string }[] = [
  { value: 'BODEGA', label: 'Bodega' },
  { value: 'FERRETERIA', label: 'Ferretería' },
  { value: 'FARMACIA', label: 'Farmacia' },
];

export const TAMANOS_NEGOCIO: { value: TamanoNegocio; label: string }[] = [
  { value: 'PEQUENO', label: 'Pequeño' },
  { value: 'MEDIANO', label: 'Mediano' },
  { value: 'GRANDE', label: 'Grande' },
];

export interface CrearNegocioRequest {
  nombre: string;
  tipoNegocio: TipoNegocio;
  ubicacion?: string | null;
  tamano?: TamanoNegocio | null;
  horarioApertura?: string | null; // "HH:mm"
  horarioCierre?: string | null;
}

export interface NegocioResponse {
  idNegocio: number;
  nombre: string;
  tipoNegocio: TipoNegocio;
  ubicacion?: string | null;
  tamano?: TamanoNegocio | null;
  horarioApertura?: string | null;
  horarioCierre?: string | null;
  fechaCreacion?: string | null;
  rolUsuario: RolNegocio;
}

/** Campo dinámico de producto según el tipo de negocio. */
export interface CampoProductoExtra {
  nombre: string;
  tipo: 'text' | 'date' | 'boolean' | 'number';
  label: string;
}

export interface ModulosActivos {
  proveedores?: boolean;
  vencimientos?: boolean;
  lotes?: boolean;
  [key: string]: boolean | undefined;
}

export interface TipoNegocioConfigResponse {
  tipoNegocio: string;
  camposProductoExtra: CampoProductoExtra[];
  modulosActivos: ModulosActivos;
}
