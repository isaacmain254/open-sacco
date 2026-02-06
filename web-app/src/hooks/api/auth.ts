import { useMutation } from "@tanstack/react-query";
import { authService, LoginPayload, RegisterPayload } from "@/services/auth";

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
    onSuccess: (data) => {
      // Handle successful Register
        if (data) {
          localStorage.setItem("accessToken", data.accessToken);
        }
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: (data) => {
      // Handle successful Login
        if (data) {
          localStorage.setItem("accessToken", data.access);
          localStorage.setItem("refreshToken", data.refresh);
        }
    },
  });
};