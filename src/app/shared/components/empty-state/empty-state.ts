import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-empty-state',
  imports: [NgIcon],
  template: `
    <div class="empty card">
      <ng-icon class="icon" [name]="icon()" aria-hidden="true" />
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
      gap: 0.75rem;
      padding: 2.5rem 1.5rem;
    }
    .icon {
      font-size: 2.25rem;
      color: var(--c-text-faint);
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
  readonly icon = input('lucideInbox');
  readonly title = input('Nada por aquí todavía');
  readonly message = input<string | null>(null);
}
