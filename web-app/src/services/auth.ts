import api from "../lib/api";

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  username: string;
  role: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GenericResponse {
  message: string;
  success: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const authService = {
  register: (data: RegisterPayload) =>
    api.post("/auth/register", data) as Promise<RegisterResponse>,

  login: (data: LoginPayload) =>
    api.post("/auth/login", data) as Promise<LoginResponse>,
};
