import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NegocioService } from '../services/negocio.service';

/**
 * Añade el header X-Id-Negocio con el negocio activo. El backend lo usa
 * (TenantInterceptor) para aislar los datos por negocio. Es inocuo en las
 * rutas que no lo requieren.
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const idNegocio = inject(NegocioService).idActivo();
  const esRutaAuth = req.url.includes('/api/auth/');

  if (idNegocio != null && !esRutaAuth) {
    req = req.clone({ setHeaders: { 'X-Id-Negocio': String(idNegocio) } });
  }
  return next(req);
};
