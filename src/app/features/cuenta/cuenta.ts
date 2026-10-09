import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ConCambiosPendientes } from '../../core/guards/pending-changes.guard';

/** La confirmación debe coincidir con la nueva contraseña. */
function coincidenValidator(group: AbstractControl): ValidationErrors | null {
  const nueva = group.get('passwordNueva')?.value;
  const confirmar = group.get('confirmar')?.value;
  return nueva && confirmar && nueva !== confirmar ? { noCoinciden: true } : null;
}

/** La nueva no puede ser igual a la actual. */
function distintaValidator(group: AbstractControl): ValidationErrors | null {
  const actual = group.get('passwordActual')?.value;
  const nueva = group.get('passwordNueva')?.value;
  return actual && nueva && actual === nueva ? { igualALaActual: true } : null;
}

@Component({
  selector: 'app-cuenta',
  imports: [ReactiveFormsModule],
  templateUrl: './cuenta.html',
  styleUrl: './cuenta.css',
})
export class Cuenta implements ConCambiosPendientes {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly usuario = this.auth.user;
  protected readonly saving = signal(false);
  protected readonly mostrar = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      passwordActual: ['', [Validators.required]],
      passwordNueva: ['', [Validators.required, Validators.minLength(8)]],
      confirmar: ['', [Validators.required]],
    },
    { validators: [coincidenValidator, distintaValidator] },
  );

  tieneCambiosPendientes(): boolean {
    return this.form.dirty && !this.saving();
  }

  /** Reglas visibles mientras se escribe (Nielsen #1 y #5). */
  protected regla(nombre: 'largo' | 'distinta' | 'coinciden'): boolean {
    const { passwordActual, passwordNueva, confirmar } = this.form.getRawValue();
    switch (nombre) {
      case 'largo':
        return passwordNueva.length >= 8;
      case 'distinta':
        return !!passwordNueva && passwordNueva !== passwordActual;
      case 'coinciden':
        return !!confirmar && passwordNueva === confirmar;
    }
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const { passwordActual, passwordNueva } = this.form.getRawValue();
    this.saving.set(true);
    this.auth.cambiarPassword({ passwordActual, passwordNueva }).subscribe({
      next: () => {
        this.toast.success('Contraseña actualizada. Úsala la próxima vez que inicies sesión.');
        this.form.reset();
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        if (err.status === 400 && /actual/i.test(err.error?.mensaje ?? '')) {
          this.form.controls.passwordActual.setErrors({ incorrecta: true });
        }
      },
    });
  }
}
