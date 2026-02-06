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
export interface RefreshTokenPayload {
  refresh: string;
}

export interface RequestPasswordResetPayload {
  email: string;
}

export interface PasswordResetPayload {
  token: string;
  uid: string;
  password: string;
}

export interface GenericResponse {
  message?: string;
  success?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh?: string;
}

export const authService = {
  register: (data: RegisterPayload) =>
    api.post("/auth/register", data) as Promise<RegisterResponse>,

  login: (data: LoginPayload) =>
    api.post("/auth/login", data) as Promise<AuthResponse>,

  logout: () => api.get("/auth/logout") as Promise<GenericResponse>,

  refreshToken: (data: RefreshTokenPayload) =>
    api.post("/auth/refresh-token", data) as Promise<AuthResponse>,

  requestPasswordReset: (data: RequestPasswordResetPayload) =>
    api.post("/auth/request-password-reset", data) as Promise<GenericResponse>,

  passwordReset: (data: PasswordResetPayload) =>
    api.post("/auth/password-reset", data) as Promise<GenericResponse>,
};
