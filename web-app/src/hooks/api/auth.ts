import { useMutation } from "@tanstack/react-query";
import {
  authService,
  LoginPayload,
  PasswordResetPayload,
  RefreshTokenPayload,
  RegisterPayload,
  RequestPasswordResetPayload,
} from "@/services/auth";

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
    onSuccess: (data) => {
      // Handle successful Register
      // if (data) {
      //   localStorage.setItem("accessToken", data.accessToken);
      // }
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: (data) => {
      // Handle successful Login
      // if (data) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh || "");
      // }
      console.log("Login successful", data);
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (data: RequestPasswordResetPayload) =>
      authService.requestPasswordReset(data),
    onSuccess: (data) => {
      return data;
    },
  });
};

export const usePasswordReset = () => {
  return useMutation({
    mutationFn: (data: PasswordResetPayload) => authService.passwordReset(data),
    onSuccess: (data) => {
      return data;
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: (data) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return data;
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (data: RefreshTokenPayload) => authService.refreshToken(data),
    onSuccess: () => {
      // localStorage.setItem("refreshToken", data.refresh || "");
    },
  });
};
