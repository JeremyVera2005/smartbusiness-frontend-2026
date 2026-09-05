# SmartBusiness IA — Frontend

Panel de gestión (Angular 22, standalone + signals, zoneless) para el backend Spring Boot
`smartbusiness-backend`. Multi-negocio con UI basada en rol y formularios de producto
que se adaptan al tipo de negocio (config-driven).

## Requisitos

- Node 20+ y npm
- El backend corriendo en `http://localhost:8080` (ver `smartbusiness-backend`)

## Desarrollo

```bash
npm install
npm start
```

Abre `http://localhost:4200/`. En modo desarrollo, `src/environments/environment.development.ts`
apunta la API a `http://localhost:8080/api`. El backend ya permite CORS desde `localhost:4200`.

## Build de producción

```bash
npm run build
```

En producción la API se resuelve como ruta relativa `/api` (`src/environments/environment.ts`),
pensado para servir el frontend detrás del mismo dominio / un reverse proxy.

## Estructura

```
src/app/
  core/
    models/         Tipos que reflejan los DTO del backend
    services/       Un servicio por dominio (auth, negocio, producto, inventario, venta, empleado, ia)
    interceptors/   auth (Bearer), tenant (X-Id-Negocio), error (toasts + logout en 401)
    guards/         authGuard, guestGuard, negocioActivoGuard, duenoGuard
  layout/shell/     Layout responsive (sidebar fija ≥960px, drawer en móvil)
  shared/           Toast, Spinner, EmptyState, MoneyPipe
  features/
    auth/           Login y registro de dueño
    negocios/       "Mis negocios" y wizard de creación
    dashboard/      KPIs del día + alertas de IA (stock y demanda)
    productos/      CRUD con campos extra dinámicos por tipo de negocio
    inventario/     Movimientos (entrada/salida/ajuste) + historial por producto
    ventas/         Historial + punto de venta (carrito)
    empleados/      Gestión de personal (solo DUEÑO)
    asistente/      Chat con el asistente IA
```

## Flujo

1. `registro` / `login` → guarda token + usuario en `localStorage`.
2. `/negocios` → elige un negocio; se guarda como negocio activo (con el rol del usuario).
3. `/app/**` → todas las llamadas envían `Authorization` y `X-Id-Negocio`.

## Cambio en el backend

Se agregó `rolUsuario` (`DUENO` | `EMPLEADO`) a `NegocioResponse` para poder mostrar/ocultar
la sección de personal según el rol. Ver `NegocioService` y `NegocioResponse` en el backend.
