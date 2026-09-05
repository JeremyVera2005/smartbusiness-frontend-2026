import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { catchError, forkJoin, of } from 'rxjs';
import { ProductoService } from '../../core/services/producto.service';
import { VentaService } from '../../core/services/venta.service';
import { IaService } from '../../core/services/ia.service';
import { NegocioService } from '../../core/services/negocio.service';
import { AlertaDemanda, AlertaStock, ProductoResponse, VentaResponse } from '../../core/models';
import { Spinner } from '../../shared/components/spinner/spinner';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe, MoneyPipe, Spinner, NgIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly productoSvc = inject(ProductoService);
  private readonly ventaSvc = inject(VentaService);
  private readonly iaSvc = inject(IaService);
  private readonly negocioSvc = inject(NegocioService);

  protected readonly loading = signal(true);
  protected readonly negocio = this.negocioSvc.activo;

  protected readonly productos = signal<ProductoResponse[]>([]);
  protected readonly ventas = signal<VentaResponse[]>([]);
  protected readonly alertasStock = signal<AlertaStock[]>([]);
  protected readonly alertasDemanda = signal<AlertaDemanda[]>([]);

  protected readonly totalProductos = computed(() => this.productos().length);
  protected readonly stockBajo = computed(
    () => this.productos().filter((p) => (p.stockMinimo ?? 0) > 0 && p.stockActual <= (p.stockMinimo ?? 0)).length,
  );
  protected readonly ventasHoy = computed(() => {
    const hoy = new Date().toDateString();
    return this.ventas().filter((v) => new Date(v.fechaVenta).toDateString() === hoy);
  });
  protected readonly ingresosHoy = computed(() =>
    this.ventasHoy().reduce((acc, v) => acc + Number(v.total), 0),
  );

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.loading.set(true);
    forkJoin({
      productos: this.productoSvc.listar().pipe(catchError(() => of([] as ProductoResponse[]))),
      ventas: this.ventaSvc.listar().pipe(catchError(() => of([] as VentaResponse[]))),
      alertasStock: this.iaSvc.alertasStock().pipe(catchError(() => of([] as AlertaStock[]))),
      alertasDemanda: this.iaSvc.alertasDemanda().pipe(catchError(() => of([] as AlertaDemanda[]))),
    }).subscribe((res) => {
      this.productos.set(res.productos);
      this.ventas.set(res.ventas);
      this.alertasStock.set(res.alertasStock);
      this.alertasDemanda.set(res.alertasDemanda);
      this.loading.set(false);
    });
  }
}
