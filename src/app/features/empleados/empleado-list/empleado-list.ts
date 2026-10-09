import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { NegocioService } from '../../../core/services/negocio.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { CrearEmpleadoRequest, EmpleadoResponse } from '../../../core/models';
import { Spinner } from '../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-empleado-list',
  imports: [ReactiveFormsModule, FormsModule, Spinner],
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

  /** Empleado al que se le está asignando una contraseña temporal. */
  protected readonly restableciendoId = signal<number | null>(null);
  protected readonly nuevaPassword = signal('');
  protected readonly guardandoPassword = signal(false);

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

  abrirRestablecer(emp: EmpleadoResponse): void {
    this.restableciendoId.set(emp.idUsuario);
    this.nuevaPassword.set('');
  }

  cancelarRestablecer(): void {
    this.restableciendoId.set(null);
  }

  guardarPassword(emp: EmpleadoResponse): void {
    const password = this.nuevaPassword();
    if (password.length < 8 || this.guardandoPassword()) {
      return;
    }
    this.guardandoPassword.set(true);
    this.empleadoSvc.restablecerPassword(this.idNegocio, emp.idUsuario, password).subscribe({
      next: () => {
        this.toast.success(`Contraseña temporal asignada a ${emp.nombre}. Compártela con esa persona.`);
        this.restableciendoId.set(null);
        this.guardandoPassword.set(false);
      },
      error: () => this.guardandoPassword.set(false),
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
