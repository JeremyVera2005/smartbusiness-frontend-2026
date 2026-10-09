import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { NegocioService } from '../../../core/services/negocio.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { CrearEmpleadoRequest, EmpleadoResponse } from '../../../core/models';
import { Spinner } from '../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-empleado-list',
  imports: [ReactiveFormsModule, Spinner],
  templateUrl: './empleado-list.html',
  styleUrl: './empleado-list.css',
})
export class EmpleadoList {
  private readonly fb = inject(FormBuilder);
  private readonly empleadoSvc = inject(EmpleadoService);
  private readonly negocioSvc = inject(NegocioService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly confirmar = inject(ConfirmService);

  private readonly idNegocio = this.negocioSvc.idActivo()!;
  protected readonly usuarioActualId = this.auth.user()?.idUsuario ?? null;

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly quitandoId = signal<number | null>(null);
  protected readonly empleados = signal<EmpleadoResponse[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.loading.set(true);
    this.empleadoSvc.listar(this.idNegocio).subscribe({
      next: (list) => {
        this.empleados.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const body: CrearEmpleadoRequest = this.form.getRawValue();
    this.saving.set(true);
    this.empleadoSvc.crear(this.idNegocio, body).subscribe({
      next: (emp) => {
        this.toast.success(`${emp.nombre} agregado al equipo.`);
        this.empleados.update((list) => [...list, emp]);
        this.form.reset({ nombre: '', email: '', password: '' });
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  async quitar(emp: EmpleadoResponse): Promise<void> {
    const ok = await this.confirmar.ask({
      title: `¿Quitar a ${emp.nombre}?`,
      message: 'Perderá el acceso a este negocio. Su cuenta y las ventas que registró se conservan.',
      confirmLabel: 'Quitar del negocio',
      danger: true,
    });
    if (!ok) {
      return;
    }
    this.quitandoId.set(emp.idUsuario);
    this.empleadoSvc.quitar(this.idNegocio, emp.idUsuario).subscribe({
      next: () => {
        this.toast.success('Empleado removido.');
        this.empleados.update((list) => list.filter((x) => x.idUsuario !== emp.idUsuario));
        this.quitandoId.set(null);
      },
      error: () => this.quitandoId.set(null),
    });
  }
}
