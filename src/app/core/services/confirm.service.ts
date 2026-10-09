import { Service, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Pinta la acción principal en rojo (acciones destructivas). */
  danger?: boolean;
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

/**
 * Reemplaza al `confirm()` nativo por un diálogo propio, accesible y con el
 * mismo estilo que el resto de la app (Nielsen #4 consistencia, #3 control:
 * "Cancelar" siempre es la opción enfocada por defecto).
 */
@Service()
export class ConfirmService {
  readonly current = signal<ConfirmRequest | null>(null);

  ask(opts: ConfirmOptions): Promise<boolean> {
    this.current()?.resolve(false);
    return new Promise((resolve) => this.current.set({ ...opts, resolve }));
  }

  close(ok: boolean): void {
    const req = this.current();
    this.current.set(null);
    req?.resolve(ok);
  }
}
