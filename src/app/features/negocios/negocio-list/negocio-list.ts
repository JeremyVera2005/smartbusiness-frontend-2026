import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ThemeToggle } from '../../../shared/components/theme-toggle/theme-toggle';
import { NegocioService } from '../../../core/services/negocio.service';
import { AuthService } from '../../../core/services/auth.service';
import { NegocioResponse, TIPOS_NEGOCIO } from '../../../core/models';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-negocio-list',
  imports: [RouterLink, Spinner, EmptyState, NgIcon, ThemeToggle],
  templateUrl: './negocio-list.html',
  styleUrl: './negocio-list.css',
})
export class NegocioList {
  private readonly negocioSvc = inject(NegocioService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly negocios = signal<NegocioResponse[]>([]);
  protected readonly usuario = this.auth.user;
  protected readonly hayNegocios = computed(() => this.negocios().length > 0);

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.loading.set(true);
    this.negocioSvc.listar().subscribe({
      next: (list) => {
        this.negocios.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  tipoLabel(tipo: string): string {
    return TIPOS_NEGOCIO.find((t) => t.value === tipo)?.label ?? tipo;
  }

  entrar(negocio: NegocioResponse): void {
    this.negocioSvc.seleccionar(negocio);
    void this.router.navigate(['/app/dashboard']);
  }

  logout(): void {
    this.auth.logout();
  }
}
