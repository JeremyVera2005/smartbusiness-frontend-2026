import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CrearNegocioRequest,
  NegocioResponse,
  TipoNegocio,
  TipoNegocioConfigResponse,
} from '../models';

const ACTIVE_KEY = 'sb_negocio';

@Injectable({ providedIn: 'root' })
export class NegocioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/negocios`;

  private readonly _activo = signal<NegocioResponse | null>(readJson<NegocioResponse>(ACTIVE_KEY));
  readonly activo = this._activo.asReadonly();
  readonly idActivo = computed(() => this._activo()?.idNegocio ?? null);
  readonly esDueno = computed(() => this._activo()?.rolUsuario === 'DUENO');

  private readonly configCache = new Map<TipoNegocio, TipoNegocioConfigResponse>();

  listar(): Observable<NegocioResponse[]> {
    return this.http.get<NegocioResponse[]>(this.base);
  }

  obtener(id: number): Observable<NegocioResponse> {
    return this.http.get<NegocioResponse>(`${this.base}/${id}`);
  }

  crear(body: CrearNegocioRequest): Observable<NegocioResponse> {
    return this.http.post<NegocioResponse>(`${this.base}/crear`, body);
  }

  obtenerConfig(tipo: TipoNegocio): Observable<TipoNegocioConfigResponse> {
    const cached = this.configCache.get(tipo);
    if (cached) {
      return of(cached);
    }
    return this.http
      .get<TipoNegocioConfigResponse>(`${this.base}/config/${tipo}`)
      .pipe(tap((cfg) => this.configCache.set(tipo, cfg)));
  }

  seleccionar(negocio: NegocioResponse): void {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(negocio));
    this._activo.set(negocio);
  }

  limpiarSeleccion(): void {
    localStorage.removeItem(ACTIVE_KEY);
    this._activo.set(null);
  }
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
