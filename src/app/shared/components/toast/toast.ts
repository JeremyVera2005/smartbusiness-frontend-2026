import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-region" role="region" aria-label="Notificaciones">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="'toast--' + t.type" role="alert">
          <span class="dot" aria-hidden="true"></span>
          <p>{{ t.text }}</p>
          <button type="button" class="close" (click)="toast.dismiss(t.id)" aria-label="Cerrar notificación">
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-region {
      position: fixed;
      z-index: 1000;
      right: 1rem;
      bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-width: min(92vw, 380px);
    }
    .toast {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: start;
      gap: 0.6rem;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-sm);
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      box-shadow: var(--shadow-lg);
      animation: toast-in 0.2s ease;
    }
    .toast p {
      font-size: 0.9rem;
      color: var(--c-text);
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 0.35rem;
      background: var(--c-text-faint);
    }
    .toast--success .dot { background: var(--c-success); }
    .toast--error .dot { background: var(--c-danger); }
    .toast--warning .dot { background: var(--c-warning); }
    .toast--info .dot { background: var(--c-info); }
    .toast--success { border-left: 4px solid var(--c-success); }
    .toast--error { border-left: 4px solid var(--c-danger); }
    .toast--warning { border-left: 4px solid var(--c-warning); }
    .toast--info { border-left: 4px solid var(--c-info); }
    .close {
      border: 0;
      background: transparent;
      cursor: pointer;
      color: var(--c-text-faint);
      font-size: 0.85rem;
      padding: 0.15rem 0.3rem;
      border-radius: 4px;
    }
    .close:hover {
      color: var(--c-text);
      background: var(--c-surface-2);
    }
    @keyframes toast-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export class Toast {
  protected readonly toast = inject(ToastService);
}
