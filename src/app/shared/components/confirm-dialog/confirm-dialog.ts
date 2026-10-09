import { Component, ElementRef, afterRenderEffect, inject, viewChild } from '@angular/core';
import { ConfirmService } from '../../../core/services/confirm.service';

/**
 * Diálogo modal nativo (<dialog>): atrapa el foco, se cierra con Esc o con
 * clic fuera, y devuelve el foco al elemento que lo abrió.
 */
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <dialog
      #dlg
      class="dlg"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-msg"
      (cancel)="$event.preventDefault(); svc.close(false)"
      (click)="onBackdropClick($event)"
    >
      @if (svc.current(); as c) {
        <h2 id="confirm-title">{{ c.title }}</h2>
        <p id="confirm-msg">{{ c.message }}</p>
        <div class="dlg__actions">
          <button type="button" class="btn btn--ghost" (click)="svc.close(false)" autofocus>
            {{ c.cancelLabel ?? 'Cancelar' }}
          </button>
          <button type="button" class="btn" [class.btn--danger]="c.danger" (click)="svc.close(true)">
            {{ c.confirmLabel ?? 'Confirmar' }}
          </button>
        </div>
      }
    </dialog>
  `,
  styles: `
    .dlg {
      width: min(92vw, 440px);
      padding: 1.5rem;
      border: 1px solid var(--c-border);
      border-radius: var(--radius);
      background: var(--c-surface);
      color: var(--c-text);
      box-shadow: var(--shadow-lg);
    }
    .dlg::backdrop {
      background: rgba(12, 18, 32, 0.55);
    }
    h2 {
      font-size: 1.15rem;
      margin-bottom: 0.5rem;
    }
    p {
      color: var(--c-text-soft);
      line-height: 1.55;
    }
    .dlg__actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.6rem;
      margin-top: 1.5rem;
    }
  `,
})
export class ConfirmDialog {
  protected readonly svc = inject(ConfirmService);
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    afterRenderEffect(() => {
      const el = this.dlg().nativeElement;
      if (this.svc.current()) {
        if (!el.open) {
          el.showModal();
        }
      } else if (el.open) {
        el.close();
      }
    });
  }

  protected onBackdropClick(ev: MouseEvent): void {
    // El clic en el ::backdrop llega con target = el propio <dialog>
    if (ev.target === this.dlg().nativeElement) {
      this.svc.close(false);
    }
  }
}
