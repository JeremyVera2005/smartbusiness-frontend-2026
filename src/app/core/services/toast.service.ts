import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  success(text: string) {
    this.push('success', text);
  }
  error(text: string) {
    this.push('error', text);
  }
  info(text: string) {
    this.push('info', text);
  }
  warning(text: string) {
    this.push('warning', text);
  }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: ToastType, text: string) {
    const id = ++this.seq;
    this.toasts.update((list) => [...list, { id, type, text }]);
    setTimeout(() => this.dismiss(id), type === 'error' ? 7000 : 4000);
  }
}
