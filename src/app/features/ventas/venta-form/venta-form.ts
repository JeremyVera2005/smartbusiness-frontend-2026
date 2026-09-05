import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ProductoService } from '../../../core/services/producto.service';
import { VentaService } from '../../../core/services/venta.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductoResponse, VentaRequest } from '../../../core/models';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

interface LineaCarrito {
  producto: ProductoResponse;
  cantidad: number;
}

@Component({
  selector: 'app-venta-form',
  imports: [FormsModule, RouterLink, MoneyPipe, Spinner, EmptyState, NgIcon],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.css',
})
export class VentaForm {
  private readonly productoSvc = inject(ProductoService);
  private readonly ventaSvc = inject(VentaService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly productos = signal<ProductoResponse[]>([]);
  protected readonly busqueda = signal('');
  protected readonly carrito = signal<LineaCarrito[]>([]);

  protected readonly disponibles = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const enCarrito = new Set(this.carrito().map((l) => l.producto.idProducto));
    return this.productos()
      .filter((p) => p.stockActual > 0 && !enCarrito.has(p.idProducto))
      .filter((p) => !q || p.nombre.toLowerCase().includes(q));
  });

  protected readonly total = computed(() =>
    this.carrito().reduce((acc, l) => acc + Number(l.producto.precioVenta) * l.cantidad, 0),
  );

  constructor() {
    this.productoSvc.listar().subscribe({
      next: (list) => {
        this.productos.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  agregar(p: ProductoResponse): void {
    this.carrito.update((c) => [...c, { producto: p, cantidad: 1 }]);
  }

  cambiarCantidad(idProducto: number, delta: number): void {
    this.carrito.update((c) =>
      c.map((l) => {
        if (l.producto.idProducto !== idProducto) {
          return l;
        }
        const cantidad = Math.min(l.producto.stockActual, Math.max(1, l.cantidad + delta));
        return { ...l, cantidad };
      }),
    );
  }

  fijarCantidad(idProducto: number, valor: number): void {
    const n = Math.floor(Number(valor));
    this.carrito.update((c) =>
      c.map((l) =>
        l.producto.idProducto === idProducto
          ? { ...l, cantidad: Math.min(l.producto.stockActual, Math.max(1, Number.isNaN(n) ? 1 : n)) }
          : l,
      ),
    );
  }

  quitar(idProducto: number): void {
    this.carrito.update((c) => c.filter((l) => l.producto.idProducto !== idProducto));
  }

  registrar(): void {
    if (!this.carrito().length || this.saving()) {
      return;
    }
    const body: VentaRequest = {
      detalles: this.carrito().map((l) => ({
        idProducto: l.producto.idProducto,
        cantidad: l.cantidad,
      })),
    };
    this.saving.set(true);
    this.ventaSvc.registrar(body).subscribe({
      next: (venta) => {
        this.toast.success(`Venta #${venta.idVenta} registrada por ${this.formatoTotal(venta.total)}.`);
        void this.router.navigate(['/app/ventas']);
      },
      error: () => this.saving.set(false),
    });
  }

  private formatoTotal(n: number): string {
    return `S/ ${Number(n).toFixed(2)}`;
  }
}
