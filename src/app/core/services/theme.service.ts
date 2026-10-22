import { Service, computed, effect, signal } from '@angular/core';

export type PreferenciaTema = 'sistema' | 'claro' | 'oscuro';

const THEME_KEY = 'sb_tema';

/**
 * Tema claro / oscuro elegido por el usuario. Por defecto sigue al sistema
 * operativo; al usar el botón de tema, la elección se recuerda en este
 * navegador. Se aplica con el atributo data-theme en <html> (ver styles.css).
 */
@Service()
export class ThemeService {
  readonly preferencia = signal<PreferenciaTema>(leerPreferencia());

  private readonly sistemaOscuro = signal(consultarSistemaOscuro());

  /** Tema que se está viendo realmente. */
  readonly oscuro = computed(() => {
    const p = this.preferencia();
    return p === 'oscuro' || (p === 'sistema' && this.sistemaOscuro());
  });

  constructor() {
    if (typeof matchMedia === 'function') {
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => this.sistemaOscuro.set(e.matches));
    }

    effect(() => {
      const p = this.preferencia();
      const html = document.documentElement;
      if (p === 'sistema') {
        html.removeAttribute('data-theme');
      } else {
        html.setAttribute('data-theme', p === 'oscuro' ? 'dark' : 'light');
      }
      try {
        if (p === 'sistema') {
          localStorage.removeItem(THEME_KEY);
        } else {
          localStorage.setItem(THEME_KEY, p);
        }
      } catch {
        // Sin almacenamiento disponible: el tema vale solo para esta sesión
      }
    });
  }

  alternar(): void {
    this.preferencia.set(this.oscuro() ? 'claro' : 'oscuro');
  }
}

function leerPreferencia(): PreferenciaTema {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'claro' || v === 'oscuro' ? v : 'sistema';
  } catch {
    return 'sistema';
  }
}

function consultarSistemaOscuro(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
}
