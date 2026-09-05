export interface RegistroDuenoRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  idUsuario: number;
  nombre: string;
  email: string;
}
