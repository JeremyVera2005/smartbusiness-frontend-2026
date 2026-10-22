import { Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ThemeService } from '../../../core/services/theme.service';

/** Botón sol / luna para cambiar entre tema claro y oscuro. */
@Component({
  selector: 'app-theme-toggle',
  imports: [NgIcon],
  template: `
    <button
      type="button"
      class="theme-btn"
      (click)="tema.alternar()"
      [attr.aria-label]="tema.oscuro() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
      [title]="tema.oscuro() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
    >
      <ng-icon [name]="tema.oscuro() ? 'lucideSun' : 'lucideMoon'" aria-hidden="true" />
    </button>
  `,
  styles: `
    .theme-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      background: var(--c-surface);
      color: var(--c-text-soft);
      font-size: 1.1rem;
      cursor: pointer;
    }
    .theme-btn:hover {
      background: var(--c-surface-2);
      color: var(--c-text);
    }
  `,
})
export class ThemeToggle {
  protected readonly tema = inject(ThemeService);
}
