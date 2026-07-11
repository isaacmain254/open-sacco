import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService, UpdateProfilePayload } from "@/services/profile";

export const useGetUserProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: profileService.getProfile,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
