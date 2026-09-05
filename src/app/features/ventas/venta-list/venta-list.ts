import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { catchError, forkJoin, of } from 'rxjs';
import { VentaService } from '../../../core/services/venta.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ProductoResponse, VentaResponse } from '../../../core/models';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

@Component({
  selector: 'app-venta-list',
  imports: [RouterLink, DatePipe, DecimalPipe, MoneyPipe, Spinner, EmptyState, NgIcon],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css',
})
export class VentaList {
  private readonly ventaSvc = inject(VentaService);
  private readonly productoSvc = inject(ProductoService);

  protected readonly loading = signal(true);
  protected readonly ventas = signal<VentaResponse[]>([]);
  protected readonly expandida = signal<number | null>(null);
  private readonly nombres = signal<Map<number, string>>(new Map());

  protected readonly totalGeneral = computed(() =>
    this.ventas().reduce((acc, v) => acc + Number(v.total), 0),
  );

  constructor() {
    forkJoin({
      ventas: this.ventaSvc.listar().pipe(catchError(() => of([] as VentaResponse[]))),
      productos: this.productoSvc.listar().pipe(catchError(() => of([] as ProductoResponse[]))),
    }).subscribe(({ ventas, productos }) => {
      this.ventas.set(ventas);
      this.nombres.set(new Map(productos.map((p) => [p.idProducto, p.nombre])));
      this.loading.set(false);
    });
  }

  nombreProducto(id: number): string {
    return this.nombres().get(id) ?? `Producto #${id}`;
  }

  toggle(id: number): void {
    this.expandida.update((cur) => (cur === id ? null : id));
  }
}
