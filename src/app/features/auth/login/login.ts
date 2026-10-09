import { Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, NgIcon, NgOptimizedImage],
  templateUrl: './login.html',
  styleUrls: ['../auth-shell.css'],
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMsg = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const redirect = new URLSearchParams(location.search).get('redirect');
        void this.router.navigateByUrl(redirect || '/negocios');
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMsg.set(
          err.status === 0
            ? 'No se pudo conectar con el servidor.'
            : (err.error?.mensaje as string) || 'Correo o contraseña incorrectos.',
        );
      },
    });
  }

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }
}
