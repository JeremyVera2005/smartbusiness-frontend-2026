import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div class="wrap" role="status" aria-live="polite">
      <span class="spinner"></span>
      <span class="visually-hidden">{{ label() }}</span>
      @if (showLabel()) {
        <span class="muted">{{ label() }}</span>
      }
    </div>
  `,
  styles: `
    .wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2.5rem 1rem;
    }
  `,
})
export class Spinner {
  readonly label = input('Cargando…');
  readonly showLabel = input(true);
}
