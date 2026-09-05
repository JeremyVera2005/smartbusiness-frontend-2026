import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe, Spinner, EmptyState],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario {
  private readonly fb = inject(FormBuilder);
  private readonly productoSvc = inject(ProductoService);
  private readonly inventarioSvc = inject(InventarioService);
  private readonly toast = inject(ToastService);

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

  protected readonly productoSel = computed(() => {
    const id = this.form.controls.idProducto.value;
    return this.productos().find((p) => p.idProducto === id) ?? null;
  });

  constructor() {
    this.productoSvc.listar().subscribe({
      next: (list) => {
        this.productos.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
    if (this.form.invalid || this.saving()) {
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
