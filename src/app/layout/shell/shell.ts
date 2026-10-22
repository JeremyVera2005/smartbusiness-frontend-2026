import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { NegocioService } from '../../core/services/negocio.service';
import { AuthService } from '../../core/services/auth.service';
import { TIPOS_NEGOCIO } from '../../core/models';
import { ShortcutsHelp } from '../../shared/components/shortcuts-help/shortcuts-help';
import { ThemeToggle } from '../../shared/components/theme-toggle/theme-toggle';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  /** Tecla que, junto con Alt, lleva a esta sección. */
  atajo: number;
  soloDueno?: boolean;
}

const NAV: NavItem[] = [
  { label: 'Panel', icon: 'lucideLayoutDashboard', link: '/app/dashboard', atajo: 1 },
  { label: 'Productos', icon: 'lucidePackage', link: '/app/productos', atajo: 2 },
  { label: 'Inventario', icon: 'lucideRepeat', link: '/app/inventario', atajo: 3 },
  { label: 'Ventas', icon: 'lucideReceipt', link: '/app/ventas', atajo: 4 },
  { label: 'Personal', icon: 'lucideUsers', link: '/app/empleados', atajo: 5, soloDueno: true },
  { label: 'Asistente IA', icon: 'lucideBot', link: '/app/asistente', atajo: 6 },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon, ShortcutsHelp, ThemeToggle],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  host: {
    '(document:keydown)': 'onKeydown($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Shell {
  private readonly negocioSvc = inject(NegocioService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly drawerOpen = signal(false);
  protected readonly userMenuOpen = signal(false);
  protected readonly ayudaOpen = signal(false);
  private readonly userBox = viewChild.required<ElementRef<HTMLElement>>('userBox');

  protected readonly negocio = this.negocioSvc.activo;
  protected readonly usuario = this.auth.user;

  protected readonly nav = computed(() => {
    const dueno = this.negocioSvc.esDueno();
    return NAV.filter((i) => !i.soloDueno || dueno);
  });

  protected readonly tipoLabel = computed(() => {
    const t = this.negocio()?.tipoNegocio;
    return TIPOS_NEGOCIO.find((x) => x.value === t)?.label ?? t ?? '';
  });

  toggleDrawer(): void {
    this.drawerOpen.update((v) => !v);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  cambiarNegocio(): void {
    this.negocioSvc.limpiarSeleccion();
  }

  logout(): void {
    this.auth.logout();
  }

  /**
   * Aceleradores para usuarios frecuentes (Nielsen #7 flexibilidad y
   * eficiencia; en GOMS reemplazan "apuntar + clic" por una sola tecla).
   */
  protected onKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape') {
      this.userMenuOpen.set(false);
      this.drawerOpen.set(false);
      return;
    }

    if (ev.altKey && !ev.ctrlKey && !ev.metaKey && /^Digit[1-6]$/.test(ev.code)) {
      const item = NAV.find((i) => i.atajo === Number(ev.code.slice(-1)));
      if (item && (!item.soloDueno || this.negocioSvc.esDueno())) {
        ev.preventDefault();
        void this.router.navigateByUrl(item.link);
      }
      return;
    }

    if (ev.ctrlKey || ev.metaKey || ev.altKey || this.estaEscribiendo(ev.target) || this.hayDialogoAbierto()) {
      return;
    }

    switch (ev.key) {
      case '?':
        ev.preventDefault();
        this.ayudaOpen.set(true);
        break;
      case '/': {
        const buscador = document.querySelector<HTMLInputElement>('#contenido input[type="search"]');
        if (buscador) {
          ev.preventDefault();
          buscador.focus();
          buscador.select();
        }
        break;
      }
      case 'n':
      case 'N':
        ev.preventDefault();
        void this.router.navigateByUrl('/app/ventas/nueva');
        break;
    }
  }

  protected onDocumentClick(ev: MouseEvent): void {
    if (this.userMenuOpen() && !this.userBox().nativeElement.contains(ev.target as Node)) {
      this.userMenuOpen.set(false);
    }
  }

  private estaEscribiendo(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
  }

  private hayDialogoAbierto(): boolean {
    return !!document.querySelector('dialog[open]');
  }
}
