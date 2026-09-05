import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NegocioService } from '../services/negocio.service';
import { ToastService } from '../services/toast.service';

/** Exige que haya un negocio activo seleccionado. */
export const negocioActivoGuard: CanActivateFn = () => {
  const negocio = inject(NegocioService);
  const router = inject(Router);

  return negocio.idActivo() != null ? true : router.createUrlTree(['/negocios']);
};

/** Exige además que el usuario sea DUEÑO del negocio activo. */
export const duenoGuard: CanActivateFn = () => {
  const negocio = inject(NegocioService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (negocio.idActivo() == null) {
    return router.createUrlTree(['/negocios']);
  }
  if (negocio.esDueno()) {
    return true;
  }
  toast.warning('Solo el dueño del negocio puede acceder a esta sección.');
  return router.createUrlTree(['/app/dashboard']);
};
