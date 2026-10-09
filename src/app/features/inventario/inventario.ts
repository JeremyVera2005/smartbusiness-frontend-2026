import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { InventarioService } from '../../core/services/inventario.service';
import { ToastService } from '../../core/services/toast.service';
import {
  MovimientoRequest,
  MovimientoResponse,
  ProductoResponse,
  TIPOS_MOVIMIENTO,
  TipoMovimiento,
} from '../../core/models';
import { Spinner } from '../../shared/components/spinner/spinner';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-inventario',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe, Spinner, EmptyState, NgIcon],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario {
  private readonly fb = inject(FormBuilder);
  private readonly productoSvc = inject(ProductoService);
  private readonly inventarioSvc = inject(InventarioService);
  private readonly toast = inject(ToastService);

  /** ?producto=ID desde el catálogo: llega con el producto ya elegido. */
  readonly producto = input<string>();

  protected readonly tipos = TIPOS_MOVIMIENTO;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly productos = signal<ProductoResponse[]>([]);
  protected readonly historial = signal<MovimientoResponse[]>([]);
  protected readonly cargandoHistorial = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    idProducto: [null as number | null, [Validators.required]],
    tipoMovimiento: ['ENTRADA' as TipoMovimiento, [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    motivo: [''],
  });

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly productoSel = computed(() => {
    const id = Number(this.valores().idProducto);
    return this.productos().find((p) => p.idProducto === id) ?? null;
  });

  /** Vista previa del resultado antes de confirmar (Nielsen #1 y #5). */
  protected readonly stockResultante = computed(() => {
    const p = this.productoSel();
    const cant = Number(this.valores().cantidad);
    if (!p || !cant || cant < 1) {
      return null;
    }
    switch (this.valores().tipoMovimiento) {
      case 'ENTRADA':
        return p.stockActual + cant;
      case 'SALIDA':
        return p.stockActual - cant;
      default:
        return cant;
    }
  });

  protected readonly salidaExcedeStock = computed(() => (this.stockResultante() ?? 0) < 0);

  constructor() {
    this.productoSvc.listar().subscribe({
      next: (list) => {
        this.productos.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    effect(() => {
      const id = Number(this.producto());
      if (id && this.productos().some((p) => p.idProducto === id) && this.form.controls.idProducto.value !== id) {
        this.form.controls.idProducto.setValue(id);
        this.onProductoChange();
      }
    });
  }

  onProductoChange(): void {
    const id = Number(this.form.controls.idProducto.value);
    this.historial.set([]);
    if (!id) {
      return;
    }
    this.cargandoHistorial.set(true);
    this.inventarioSvc.historial(id).subscribe({
      next: (movs) => {
        this.historial.set(movs);
        this.cargandoHistorial.set(false);
      },
      error: () => this.cargandoHistorial.set(false),
    });
  }

  tipoLabel(t: TipoMovimiento): string {
    return this.tipos.find((x) => x.value === t)?.label ?? t;
  }

  submit(): void {
    if (this.form.invalid || this.salidaExcedeStock() || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const body: MovimientoRequest = {
      idProducto: Number(raw.idProducto),
      tipoMovimiento: raw.tipoMovimiento,
      cantidad: Number(raw.cantidad),
      motivo: raw.motivo.trim() || null,
    };

    this.saving.set(true);
    this.inventarioSvc.registrar(body).subscribe({
      next: (mov) => {
        this.toast.success(`Movimiento registrado. Nuevo stock: ${mov.stockResultante}.`);
        this.historial.update((list) => [mov, ...list]);
        this.productos.update((list) =>
          list.map((p) =>
            p.idProducto === body.idProducto ? { ...p, stockActual: mov.stockResultante } : p,
          ),
        );
        this.form.patchValue({ cantidad: 1, motivo: '' });
        this.form.controls.cantidad.markAsUntouched();
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
