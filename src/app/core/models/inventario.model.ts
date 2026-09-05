export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export const TIPOS_MOVIMIENTO: { value: TipoMovimiento; label: string; help: string }[] = [
  { value: 'ENTRADA', label: 'Entrada', help: 'Compra a proveedor o ajuste positivo' },
  { value: 'SALIDA', label: 'Salida', help: 'Merma, robo o ajuste negativo' },
  { value: 'AJUSTE', label: 'Ajuste', help: 'Fija el stock a un valor exacto (conteo físico)' },
];

export interface MovimientoRequest {
  idProducto: number;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  motivo?: string | null;
}

export interface MovimientoResponse {
  idMovimiento: number;
  idProducto: number;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  stockResultante: number;
  motivo?: string | null;
  fechaMovimiento: string;
}
