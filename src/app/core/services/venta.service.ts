import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VentaRequest, VentaResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/ventas`;

  listar(): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(this.base);
  }

  registrar(body: VentaRequest): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(this.base, body);
  }
}
