import { useGetUserProfile } from "@/hooks/api/profile";

export function useUserProfileInfo() {
  const { data: profile, isLoading, error } = useGetUserProfile();

  return {
    profile,
    isLoading,
    error,
  };
}
