import { Component, computed, inject, input, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ProductoService } from '../../../core/services/producto.service';
import { NegocioService } from '../../../core/services/negocio.service';
import { ToastService } from '../../../core/services/toast.service';
import { CampoProductoExtra, ProductoRequest } from '../../../core/models';
import { ConCambiosPendientes } from '../../../core/guards/pending-changes.guard';
import { Spinner } from '../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-producto-form',
  imports: [ReactiveFormsModule, RouterLink, Spinner, NgIcon],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css',
})
export class ProductoForm implements ConCambiosPendientes {
  private readonly fb = inject(FormBuilder);
  private readonly productoSvc = inject(ProductoService);
  private readonly negocioSvc = inject(NegocioService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Route param (producto-form se reutiliza para "nuevo" y "editar"). */
  readonly id = input<string>();

  protected readonly editando = computed(() => !!this.id());
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly campos = signal<CampoProductoExtra[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    descripcion: [''],
    precioVenta: [null as number | null, [Validators.required, Validators.min(0)]],
    precioCompra: [null as number | null, [Validators.min(0)]],
    stockActual: [0, [Validators.required, Validators.min(0)]],
    stockMinimo: [0 as number | null, [Validators.min(0)]],
    categoria: [''],
    atributosExtra: this.fb.group({} as Record<string, FormControl>),
  });

  tieneCambiosPendientes(): boolean {
    return this.form.dirty && !this.saving();
  }

  protected get extraGroup(): FormGroup {
    return this.form.controls.atributosExtra as FormGroup;
  }

  constructor() {
    this.init();
  }

  private init(): void {
    const negocio = this.negocioSvc.activo();
    if (!negocio) {
      void this.router.navigate(['/negocios']);
      return;
    }

    this.negocioSvc.obtenerConfig(negocio.tipoNegocio).subscribe({
      next: (cfg) => {
        const campos = cfg.camposProductoExtra ?? [];
        this.campos.set(campos);
        for (const campo of campos) {
          this.extraGroup.addControl(
            campo.nombre,
            new FormControl(campo.tipo === 'boolean' ? false : ''),
          );
        }
        if (this.editando()) {
          this.cargarProducto(Number(this.id()));
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        // Sin config: seguimos con los campos base
        if (this.editando()) {
          this.cargarProducto(Number(this.id()));
        } else {
          this.loading.set(false);
        }
      },
    });
  }

  private cargarProducto(idProducto: number): void {
    this.productoSvc.obtener(idProducto).subscribe({
      next: (p) => {
        this.form.patchValue({
          nombre: p.nombre,
          descripcion: p.descripcion ?? '',
          precioVenta: p.precioVenta,
          precioCompra: p.precioCompra ?? null,
          stockActual: p.stockActual,
          stockMinimo: p.stockMinimo ?? 0,
          categoria: p.categoria ?? '',
        });
        const extra = p.atributosExtra ?? {};
        for (const campo of this.campos()) {
          const ctrl = this.extraGroup.get(campo.nombre);
          if (ctrl && extra[campo.nombre] != null) {
            ctrl.setValue(extra[campo.nombre]);
          }
        }
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('No se encontró el producto.');
        void this.router.navigate(['/app/productos']);
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();

    const atributosExtra: Record<string, unknown> = {};
    for (const campo of this.campos()) {
      const val = this.extraGroup.get(campo.nombre)?.value;
      if (val !== '' && val !== null && val !== undefined) {
        atributosExtra[campo.nombre] = campo.tipo === 'number' ? Number(val) : val;
      }
    }

    const body: ProductoRequest = {
      nombre: raw.nombre.trim(),
      descripcion: raw.descripcion?.trim() || null,
      precioVenta: Number(raw.precioVenta),
      precioCompra: raw.precioCompra != null ? Number(raw.precioCompra) : null,
      stockActual: Number(raw.stockActual),
      stockMinimo: raw.stockMinimo != null ? Number(raw.stockMinimo) : null,
      categoria: raw.categoria?.trim() || null,
      atributosExtra,
    };

    this.saving.set(true);
    const req$ = this.editando()
      ? this.productoSvc.actualizar(Number(this.id()), body)
      : this.productoSvc.crear(body);

    req$.subscribe({
      next: () => {
        this.toast.success(this.editando() ? 'Producto actualizado.' : 'Producto creado.');
        this.form.markAsPristine();
        void this.router.navigate(['/app/productos']);
      },
      error: () => this.saving.set(false),
    });
  }
}
