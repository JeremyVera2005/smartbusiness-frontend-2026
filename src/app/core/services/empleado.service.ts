import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrearEmpleadoRequest, EmpleadoResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private readonly http = inject(HttpClient);

  private base(idNegocio: number): string {
    return `${environment.apiUrl}/negocios/${idNegocio}/empleados`;
  }

  listar(idNegocio: number): Observable<EmpleadoResponse[]> {
    return this.http.get<EmpleadoResponse[]>(this.base(idNegocio));
  }

  crear(idNegocio: number, body: CrearEmpleadoRequest): Observable<EmpleadoResponse> {
    return this.http.post<EmpleadoResponse>(this.base(idNegocio), body);
  }

  restablecerPassword(idNegocio: number, idUsuarioEmpleado: number, password: string): Observable<void> {
    return this.http.put<void>(`${this.base(idNegocio)}/${idUsuarioEmpleado}/password`, { password });
  }

  quitar(idNegocio: number, idUsuarioEmpleado: number): Observable<void> {
    return this.http.delete<void>(`${this.base(idNegocio)}/${idUsuarioEmpleado}`);
  }
}
