import { RolNegocio } from './negocio.model';

export interface CrearEmpleadoRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface EmpleadoResponse {
  idUsuario: number;
  nombre: string;
  email: string;
  rol: RolNegocio;
  idNegocio: number;
}
