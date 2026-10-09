import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CambiarPasswordRequest, LoginRequest, LoginResponse, RegistroDuenoRequest } from '../models';

const TOKEN_KEY = 'sb_token';
const USER_KEY = 'sb_user';

export interface SessionUser {
  idUsuario: number;
  nombre: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}/auth`;

  private readonly _token = signal<string | null>(readStorage(TOKEN_KEY));
  private readonly _user = signal<SessionUser | null>(readJson<SessionUser>(USER_KEY));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  register(body: RegistroDuenoRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/registro`, body)
      .pipe(tap((res) => this.persistSession(res)));
  }

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/login`, body)
      .pipe(tap((res) => this.persistSession(res)));
  }

  cambiarPassword(body: CambiarPasswordRequest): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/usuarios/me/password`, body);
  }

  logout(redirect = true): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    if (redirect) {
      void this.router.navigate(['/login']);
    }
  }

  private persistSession(res: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    const user: SessionUser = {
      idUsuario: res.idUsuario,
      nombre: res.nombre,
      email: res.email,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(res.token);
    this._user.set(user);
  }
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
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
