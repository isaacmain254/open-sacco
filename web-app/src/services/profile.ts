import api from "@/lib/api";
import { normalizeUser } from "@/services/users";

export interface UpdateProfilePayload {
  username: string;
  email: string;
  profile_image?: File | null;
}

export const profileService = {
  getProfile: () =>
    (api.get("/auth/me") as Promise<{
      id: number;
      username: string;
      email: string;
      role?: string;
      profile_image?: string | null;
    }>).then(normalizeUser),

  updateProfile: (data: UpdateProfilePayload) => {
    const formData = new FormData();

    formData.append("username", data.username);
    formData.append("email", data.email);

    if (data.profile_image instanceof File) {
      formData.append("profile_image", data.profile_image);
    }

    return (
      api.patch("/auth/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }) as Promise<{
        id: number;
        username: string;
        email: string;
        role?: string;
        profile_image?: string | null;
      }>
    ).then((user) => normalizeUser(user));
  },
};
