export interface DetalleVentaRequest {
  idProducto: number;
  cantidad: number;
}

export interface VentaRequest {
  detalles: DetalleVentaRequest[];
}

export interface DetalleVentaResponse {
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaResponse {
  idVenta: number;
  total: number;
  fechaVenta: string;
  detalles: DetalleVentaResponse[];
}
