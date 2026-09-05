import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { NegocioService } from '../../../core/services/negocio.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  CrearNegocioRequest,
  TIPOS_NEGOCIO,
  TAMANOS_NEGOCIO,
  TipoNegocio,
} from '../../../core/models';

@Component({
  selector: 'app-negocio-form',
  imports: [ReactiveFormsModule, RouterLink, NgIcon],
  templateUrl: './negocio-form.html',
  styleUrl: './negocio-form.css',
})
export class NegocioForm {
  private readonly fb = inject(FormBuilder);
  private readonly negocioSvc = inject(NegocioService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly tipos = TIPOS_NEGOCIO;
  protected readonly tamanos = TAMANOS_NEGOCIO;

  protected readonly loading = signal(false);
  protected readonly camposExtra = signal<string[]>([]);
  protected readonly modulos = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    tipoNegocio: ['', [Validators.required]],
    ubicacion: [''],
    tamano: [''],
    horarioApertura: [''],
    horarioCierre: [''],
  });

  logout(): void {
    this.auth.logout();
  }

  onTipoChange(): void {
    const tipo = this.form.controls.tipoNegocio.value as TipoNegocio | '';
    if (!tipo) {
      this.camposExtra.set([]);
      this.modulos.set([]);
      return;
    }
    this.negocioSvc.obtenerConfig(tipo).subscribe({
      next: (cfg) => {
        this.camposExtra.set((cfg.camposProductoExtra ?? []).map((c) => c.label));
        this.modulos.set(
          Object.entries(cfg.modulosActivos ?? {})
            .filter(([, v]) => v)
            .map(([k]) => k),
        );
      },
      error: () => {
        this.camposExtra.set([]);
        this.modulos.set([]);
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const body: CrearNegocioRequest = {
      nombre: raw.nombre.trim(),
      tipoNegocio: raw.tipoNegocio as TipoNegocio,
      ubicacion: raw.ubicacion.trim() || null,
      tamano: (raw.tamano || null) as CrearNegocioRequest['tamano'],
      horarioApertura: raw.horarioApertura || null,
      horarioCierre: raw.horarioCierre || null,
    };

    this.loading.set(true);
    this.negocioSvc.crear(body).subscribe({
      next: (negocio) => {
        this.toast.success(`Negocio "${negocio.nombre}" creado.`);
        this.negocioSvc.seleccionar(negocio);
        void this.router.navigate(['/app/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status !== 0 && !err.error?.mensaje) {
          this.toast.error('No se pudo crear el negocio.');
        }
      },
    });
  }
}
