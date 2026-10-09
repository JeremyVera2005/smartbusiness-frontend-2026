import { Component, ElementRef, afterRenderEffect, model, viewChild } from '@angular/core';

export interface Atajo {
  teclas: string[];
  accion: string;
}

export const ATAJOS_GLOBALES: Atajo[] = [
  { teclas: ['N'], accion: 'Nueva venta' },
  { teclas: ['/'], accion: 'Ir al buscador de la página' },
  { teclas: ['Alt', '1 … 6'], accion: 'Ir a Panel, Productos, Inventario, Ventas, Personal o Asistente' },
  { teclas: ['?'], accion: 'Mostrar esta ayuda' },
  { teclas: ['Esc'], accion: 'Cerrar menús y diálogos' },
];

export const ATAJOS_VENTA: Atajo[] = [
  { teclas: ['Enter'], accion: 'En el buscador: agrega el primer producto encontrado' },
  { teclas: ['Ctrl', 'Enter'], accion: 'Registrar la venta' },
];

/** Ayuda y documentación en contexto (Nielsen #10). */
@Component({
  selector: 'app-shortcuts-help',
  template: `
    <dialog
      #dlg
      class="dlg"
      aria-labelledby="atajos-title"
      (cancel)="$event.preventDefault(); open.set(false)"
      (click)="onBackdropClick($event)"
    >
      <div class="dlg__head">
        <h2 id="atajos-title">Atajos de teclado</h2>
        <button type="button" class="btn btn--ghost btn--sm" (click)="open.set(false)">Cerrar</button>
      </div>

      <h3>En toda la aplicación</h3>
      <dl>
        @for (a of globales; track a.accion) {
          <div class="row">
            <dt>
              @for (k of a.teclas; track k; let last = $last) {
                <kbd>{{ k }}</kbd>@if (!last) {<span class="plus">+</span>}
              }
            </dt>
            <dd>{{ a.accion }}</dd>
          </div>
        }
      </dl>

      <h3>En Nueva venta</h3>
      <dl>
        @for (a of venta; track a.accion) {
          <div class="row">
            <dt>
              @for (k of a.teclas; track k; let last = $last) {
                <kbd>{{ k }}</kbd>@if (!last) {<span class="plus">+</span>}
              }
            </dt>
            <dd>{{ a.accion }}</dd>
          </div>
        }
      </dl>

      <p class="tip">
        Los atajos de una sola tecla no se activan mientras escribes en un campo.
      </p>
    </dialog>
  `,
  styles: `
    .dlg {
      width: min(94vw, 520px);
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
    .dlg__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    h2 {
      font-size: 1.15rem;
    }
    h3 {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--c-text-faint);
      margin: 1.1rem 0 0.4rem;
    }
    .row {
      display: grid;
      grid-template-columns: 9.5rem 1fr;
      gap: 0.75rem;
      align-items: center;
      padding: 0.45rem 0;
      border-bottom: 1px solid var(--c-border);
    }
    dd {
      color: var(--c-text-soft);
      font-size: 0.9rem;
    }
    .plus {
      margin: 0 0.25rem;
      color: var(--c-text-faint);
    }
    .tip {
      margin-top: 1rem;
      font-size: 0.82rem;
      color: var(--c-text-faint);
    }
  `,
})
export class ShortcutsHelp {
  readonly open = model(false);

  protected readonly globales = ATAJOS_GLOBALES;
  protected readonly venta = ATAJOS_VENTA;
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    afterRenderEffect(() => {
      const el = this.dlg().nativeElement;
      if (this.open() && !el.open) {
        el.showModal();
      } else if (!this.open() && el.open) {
        el.close();
      }
    });
  }

  protected onBackdropClick(ev: MouseEvent): void {
    if (ev.target === this.dlg().nativeElement) {
      this.open.set(false);
    }
  }
}
