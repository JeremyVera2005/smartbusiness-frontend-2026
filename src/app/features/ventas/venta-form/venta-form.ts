import { Component, ElementRef, afterRenderEffect, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ProductoService } from '../../../core/services/producto.service';
import { VentaService } from '../../../core/services/venta.service';
import { ToastService } from '../../../core/services/toast.service';
import { NegocioService } from '../../../core/services/negocio.service';
import { ConCambiosPendientes } from '../../../core/guards/pending-changes.guard';
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
  host: {
    '(document:keydown.control.enter)': 'onAtajoRegistrar($event)',
    '(document:keydown.meta.enter)': 'onAtajoRegistrar($event)',
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
})
export class VentaForm implements ConCambiosPendientes {
  private readonly productoSvc = inject(ProductoService);
  private readonly ventaSvc = inject(VentaService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  private readonly buscador = viewChild<ElementRef<HTMLInputElement>>('buscador');
  private buscadorEnfocado = false;

  /** En pantallas táctiles no se muestran indicaciones de teclado (Enter, Ctrl). */
  protected readonly tactil = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

  protected readonly esDueno = inject(NegocioService).esDueno;
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

  protected readonly unidades = computed(() =>
    this.carrito().reduce((acc, l) => acc + l.cantidad, 0),
  );

  constructor() {
    this.productoSvc.listar().subscribe({
      next: (list) => {
        this.productos.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    // El cursor arranca en el buscador: se puede vender sin tocar el mouse
    afterRenderEffect(() => {
      const el = this.buscador()?.nativeElement;
      if (el && !this.buscadorEnfocado) {
        this.buscadorEnfocado = true;
        el.focus();
      }
    });
  }

  tieneCambiosPendientes(): boolean {
    return this.carrito().length > 0 && !this.saving();
  }

  protected onBeforeUnload(ev: BeforeUnloadEvent): void {
    if (this.tieneCambiosPendientes()) {
      ev.preventDefault();
    }
  }

  protected onAtajoRegistrar(ev: Event): void {
    ev.preventDefault();
    this.registrar();
  }

  /** Enter en el buscador: agrega el primer resultado y deja el buscador listo. */
  agregarPrimero(): void {
    const p = this.disponibles()[0];
    if (p) {
      this.agregar(p);
      this.busqueda.set('');
    }
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
    const antes = this.carrito();
    const linea = antes.find((l) => l.producto.idProducto === idProducto);
    if (!linea) {
      return;
    }
    this.carrito.set(antes.filter((l) => l !== linea));
    this.toast.info(`Quitaste "${linea.producto.nombre}" del carrito.`, {
      label: 'Deshacer',
      run: () => this.carrito.set(antes),
    });
  }

  vaciar(): void {
    const antes = this.carrito();
    this.carrito.set([]);
    this.toast.info('Carrito vaciado.', { label: 'Deshacer', run: () => this.carrito.set(antes) });
    this.buscador()?.nativeElement.focus();
  }

  registrar(): void {
    if (!this.carrito().length || this.saving()) {
      return;
    }
    const lineas = this.carrito();
    const body: VentaRequest = {
      detalles: lineas.map((l) => ({
        idProducto: l.producto.idProducto,
        cantidad: l.cantidad,
      })),
    };
    this.saving.set(true);
    this.ventaSvc.registrar(body).subscribe({
      next: (venta) => {
        // Se queda en el punto de venta listo para el siguiente cliente
        const vendidas = new Map(lineas.map((l) => [l.producto.idProducto, l.cantidad]));
        this.productos.update((list) =>
          list.map((p) =>
            vendidas.has(p.idProducto)
              ? { ...p, stockActual: p.stockActual - (vendidas.get(p.idProducto) ?? 0) }
              : p,
          ),
        );
        this.carrito.set([]);
        this.saving.set(false);
        this.toast.success(`Venta #${venta.idVenta} registrada por ${this.formatoTotal(venta.total)}.`, {
          label: 'Ver ventas',
          run: () => void this.router.navigate(['/app/ventas']),
        });
        this.buscador()?.nativeElement.focus();
      },
      error: () => this.saving.set(false),
    });
  }

  private formatoTotal(n: number): string {
    return `S/ ${Number(n).toFixed(2)}`;
  }
}
