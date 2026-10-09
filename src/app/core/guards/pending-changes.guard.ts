import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ConfirmService } from '../services/confirm.service';

export interface ConCambiosPendientes {
  tieneCambiosPendientes(): boolean;
}

/**
 * Evita perder trabajo al salir de un formulario o de una venta a medio
 * armar (Nielsen #5 prevención de errores).
 */
export const pendingChangesGuard: CanDeactivateFn<ConCambiosPendientes> = (component) => {
  if (!component.tieneCambiosPendientes()) {
    return true;
  }
  return inject(ConfirmService).ask({
    title: '¿Salir sin guardar?',
    message: 'Tienes cambios sin guardar en esta pantalla. Si sales ahora, se perderán.',
    confirmLabel: 'Salir sin guardar',
    cancelLabel: 'Seguir editando',
    danger: true,
  });
};
