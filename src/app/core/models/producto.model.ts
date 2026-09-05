export interface ProductoRequest {
  nombre: string;
  descripcion?: string | null;
  precioVenta: number;
  precioCompra?: number | null;
  stockActual: number;
  stockMinimo?: number | null;
  categoria?: string | null;
  atributosExtra?: Record<string, unknown> | null;
}

export interface ProductoResponse {
  idProducto: number;
  nombre: string;
  descripcion?: string | null;
  precioVenta: number;
  precioCompra?: number | null;
  stockActual: number;
  stockMinimo?: number | null;
  categoria?: string | null;
  atributosExtra?: Record<string, unknown> | null;
  activo: boolean;
}
