import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IaService } from '../../core/services/ia.service';

interface Mensaje {
  autor: 'usuario' | 'asistente';
  texto: string;
}

const SUGERENCIAS = [
  '¿Qué productos están en riesgo de agotarse?',
  '¿Cómo van mis ventas esta semana?',
  '¿Qué debería reabastecer pronto?',
];

@Component({
  selector: 'app-asistente',
  imports: [FormsModule],
  templateUrl: './asistente.html',
  styleUrl: './asistente.css',
})
export class Asistente {
  private readonly iaSvc = inject(IaService);

  protected readonly sugerencias = SUGERENCIAS;
  protected readonly mensajes = signal<Mensaje[]>([]);
  protected readonly pregunta = signal('');
  protected readonly enviando = signal(false);

  preguntar(texto?: string): void {
    const q = (texto ?? this.pregunta()).trim();
    if (!q || this.enviando()) {
      return;
    }
    this.mensajes.update((m) => [...m, { autor: 'usuario', texto: q }]);
    this.pregunta.set('');
    this.enviando.set(true);

    this.iaSvc.preguntar(q).subscribe({
      next: (respuesta) => {
        this.mensajes.update((m) => [...m, { autor: 'asistente', texto: respuesta }]);
        this.enviando.set(false);
      },
      error: () => {
        this.mensajes.update((m) => [
          ...m,
          { autor: 'asistente', texto: 'No pude responder en este momento. Intenta nuevamente.' },
        ]);
        this.enviando.set(false);
      },
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.preguntar();
    }
  }
}
