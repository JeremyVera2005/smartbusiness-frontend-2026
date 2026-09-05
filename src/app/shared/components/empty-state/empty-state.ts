import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty card">
      <div class="icon" aria-hidden="true">{{ icon() }}</div>
      <h2>{{ title() }}</h2>
      @if (message()) {
        <p class="muted">{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      padding: 2.5rem 1.5rem;
    }
    .icon {
      font-size: 2.5rem;
      line-height: 1;
    }
    h2 {
      font-size: 1.1rem;
    }
    p {
      max-width: 42ch;
    }
    :host ::ng-deep .btn {
      margin-top: 0.75rem;
    }
  `,
})
export class EmptyState {
  readonly icon = input('📭');
  readonly title = input('Nada por aquí todavía');
  readonly message = input<string | null>(null);
}
