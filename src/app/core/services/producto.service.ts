import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductoRequest, ProductoResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/productos`;

  listar(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(this.base);
  }

  stockBajo(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.base}/stock-bajo`);
  }

  obtener(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.base}/${id}`);
  }

  crear(body: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.base, body);
  }

  actualizar(id: number, body: ProductoRequest): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.base}/${id}`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
