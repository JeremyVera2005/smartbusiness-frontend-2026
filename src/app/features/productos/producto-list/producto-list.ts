import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ProductoResponse } from '../../../core/models';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

@Component({
  selector: 'app-producto-list',
  imports: [RouterLink, FormsModule, DecimalPipe, MoneyPipe, Spinner, EmptyState],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList {
  private readonly productoSvc = inject(ProductoService);
  private readonly toast = inject(ToastService);
  private readonly confirmar = inject(ConfirmService);

  protected readonly loading = signal(true);
  protected readonly productos = signal<ProductoResponse[]>([]);
  protected readonly busqueda = signal('');
  protected readonly soloStockBajo = signal(false);
  protected readonly eliminandoId = signal<number | null>(null);

  protected readonly filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    return this.productos().filter((p) => {
      const coincide =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        (p.categoria ?? '').toLowerCase().includes(q);
      const bajo = !this.soloStockBajo() || this.esStockBajo(p);
      return coincide && bajo;
    });
  });

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.loading.set(true);
    this.productoSvc.listar().subscribe({
      next: (list) => {
        this.productos.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  esStockBajo(p: ProductoResponse): boolean {
    return (p.stockMinimo ?? 0) > 0 && p.stockActual <= (p.stockMinimo ?? 0);
  }

  async eliminar(p: ProductoResponse): Promise<void> {
    const ok = await this.confirmar.ask({
      title: `¿Desactivar "${p.nombre}"?`,
      message: 'Dejará de aparecer en el catálogo y en el punto de venta. El historial de ventas y movimientos se conserva.',
      confirmLabel: 'Desactivar',
      danger: true,
    });
    if (!ok) {
      return;
    }
    this.eliminandoId.set(p.idProducto);
    this.productoSvc.eliminar(p.idProducto).subscribe({
      next: () => {
        this.toast.success('Producto desactivado.');
        this.productos.update((list) => list.filter((x) => x.idProducto !== p.idProducto));
        this.eliminandoId.set(null);
      },
      error: () => this.eliminandoId.set(null),
    });
  }
}
