import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface Toast {
  id: number;
  type: ToastType;
  text: string;
  /** Acción opcional junto al mensaje, p. ej. "Deshacer" (Nielsen #3). */
  action?: ToastAction;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  success(text: string, action?: ToastAction) {
    this.push('success', text, action);
  }
  error(text: string) {
    this.push('error', text);
  }
  info(text: string, action?: ToastAction) {
    this.push('info', text, action);
  }
  warning(text: string) {
    this.push('warning', text);
  }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: ToastType, text: string, action?: ToastAction) {
    const id = ++this.seq;
    this.toasts.update((list) => [...list, { id, type, text, action }]);
    // Con acción se deja más tiempo para que el usuario alcance a usarla
    setTimeout(() => this.dismiss(id), type === 'error' || action ? 7000 : 4000);
  }
}
