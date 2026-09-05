import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlertaDemanda, AlertaStock } from '../models';

@Injectable({ providedIn: 'root' })
export class IaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/ia`;

  alertasStock(): Observable<AlertaStock[]> {
    return this.http.get<AlertaStock[]>(`${this.base}/alertas/stock`);
  }

  alertasDemanda(): Observable<AlertaDemanda[]> {
    return this.http.get<AlertaDemanda[]>(`${this.base}/alertas/demanda`);
  }

  preguntar(pregunta: string): Observable<string> {
    return this.http
      .post<{ respuesta: string }>(`${this.base}/asistente`, { pregunta })
      .pipe(map((r) => r.respuesta));
  }
}
