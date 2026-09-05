import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Traduce los errores del backend Spring a un toast legible y desloguea
 * automáticamente cuando el token es inválido o expiró.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else if (err.status === 401) {
        if (auth.isAuthenticated()) {
          toast.error('Tu sesión expiró. Vuelve a iniciar sesión.');
          auth.logout();
        }
      } else if (!req.url.includes('/api/auth/')) {
        toast.error(extraerMensaje(err));
      }
      return throwError(() => err);
    }),
  );
};

function extraerMensaje(err: HttpErrorResponse): string {
  const body = err.error;
  if (body && typeof body === 'object') {
    if (typeof body.mensaje === 'string') {
      return body.mensaje;
    }
    if (body.errores && typeof body.errores === 'object') {
      const primero = Object.values(body.errores)[0];
      if (typeof primero === 'string') {
        return primero;
      }
    }
  }
  if (err.status === 403) {
    return 'No tienes permiso para realizar esta acción.';
  }
  return 'Ocurrió un error inesperado. Intenta nuevamente.';
}
