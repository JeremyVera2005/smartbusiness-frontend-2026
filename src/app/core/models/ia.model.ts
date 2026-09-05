export type NivelAlertaStock = 'CRITICO' | 'ALERTA';
export type TipoAlertaDemanda = 'ALTA_DEMANDA' | 'CAIDA_VENTAS';

export interface AlertaStock {
  idProducto: number;
  nombreProducto: string;
  stockActual: number;
  promedioVentaDiario: number;
  diasRestantesEstimados: number;
  nivel: NivelAlertaStock;
}

export interface AlertaDemanda {
  idProducto: number;
  nombreProducto: string;
  unidadesSemanaActual: number;
  unidadesSemanaAnterior: number;
  variacionPorcentual: number;
  tipo: TipoAlertaDemanda;
}

export interface AsistenteRespuesta {
  respuesta: string;
}
