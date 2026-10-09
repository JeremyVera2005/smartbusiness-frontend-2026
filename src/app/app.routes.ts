import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { duenoGuard, negocioActivoGuard } from './core/guards/negocio.guard';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    title: 'Iniciar sesión · SmartBusiness IA',
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
    title: 'Crear cuenta · SmartBusiness IA',
  },
  {
    path: 'negocios',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/negocios/negocio-list/negocio-list').then((m) => m.NegocioList),
        title: 'Mis negocios · SmartBusiness IA',
      },
      {
        path: 'nuevo',
        loadComponent: () =>
          import('./features/negocios/negocio-form/negocio-form').then((m) => m.NegocioForm),
        title: 'Nuevo negocio · SmartBusiness IA',
      },
    ],
  },
  {
    path: 'app',
    canActivate: [authGuard, negocioActivoGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
        title: 'Panel · SmartBusiness IA',
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/producto-list/producto-list').then((m) => m.ProductoList),
        title: 'Productos · SmartBusiness IA',
      },
      {
        path: 'productos/nuevo',
        canDeactivate: [pendingChangesGuard],
        loadComponent: () =>
          import('./features/productos/producto-form/producto-form').then((m) => m.ProductoForm),
        title: 'Nuevo producto · SmartBusiness IA',
      },
      {
        path: 'productos/:id/editar',
        canDeactivate: [pendingChangesGuard],
        loadComponent: () =>
          import('./features/productos/producto-form/producto-form').then((m) => m.ProductoForm),
        title: 'Editar producto · SmartBusiness IA',
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/inventario/inventario').then((m) => m.Inventario),
        title: 'Inventario · SmartBusiness IA',
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./features/ventas/venta-list/venta-list').then((m) => m.VentaList),
        title: 'Ventas · SmartBusiness IA',
      },
      {
        path: 'ventas/nueva',
        canDeactivate: [pendingChangesGuard],
        loadComponent: () =>
          import('./features/ventas/venta-form/venta-form').then((m) => m.VentaForm),
        title: 'Nueva venta · SmartBusiness IA',
      },
      {
        path: 'empleados',
        canActivate: [duenoGuard],
        loadComponent: () =>
          import('./features/empleados/empleado-list/empleado-list').then((m) => m.EmpleadoList),
        title: 'Personal · SmartBusiness IA',
      },
      {
        path: 'cuenta',
        canDeactivate: [pendingChangesGuard],
        loadComponent: () => import('./features/cuenta/cuenta').then((m) => m.Cuenta),
        title: 'Mi cuenta · SmartBusiness IA',
      },
      {
        path: 'asistente',
        loadComponent: () =>
          import('./features/asistente/asistente').then((m) => m.Asistente),
        title: 'Asistente IA · SmartBusiness IA',
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'negocios' },
  { path: '**', redirectTo: 'negocios' },
];
