import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { NegocioService } from '../../core/services/negocio.service';
import { AuthService } from '../../core/services/auth.service';
import { TIPOS_NEGOCIO } from '../../core/models';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  soloDueno?: boolean;
}

const NAV: NavItem[] = [
  { label: 'Panel', icon: 'lucideLayoutDashboard', link: '/app/dashboard' },
  { label: 'Productos', icon: 'lucidePackage', link: '/app/productos' },
  { label: 'Inventario', icon: 'lucideRepeat', link: '/app/inventario' },
  { label: 'Ventas', icon: 'lucideReceipt', link: '/app/ventas' },
  { label: 'Personal', icon: 'lucideUsers', link: '/app/empleados', soloDueno: true },
  { label: 'Asistente IA', icon: 'lucideBot', link: '/app/asistente' },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private readonly negocioSvc = inject(NegocioService);
  private readonly auth = inject(AuthService);

  protected readonly drawerOpen = signal(false);
  protected readonly userMenuOpen = signal(false);

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
}
