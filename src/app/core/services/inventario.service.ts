import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MovimientoRequest, MovimientoResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/inventario`;

  registrar(body: MovimientoRequest): Observable<MovimientoResponse> {
    return this.http.post<MovimientoResponse>(`${this.base}/movimientos`, body);
  }

  historial(idProducto: number): Observable<MovimientoResponse[]> {
    return this.http.get<MovimientoResponse[]>(`${this.base}/movimientos/producto/${idProducto}`);
  }
}
