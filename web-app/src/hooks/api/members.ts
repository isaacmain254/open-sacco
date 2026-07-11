import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { membersService, MemberProps } from "@/services/members";

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<MemberProps, "id" | "membership_number">) =>
      membersService.createMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: string;
      data: Partial<MemberProps>;
    }) => membersService.updateMember(memberId, data),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member", memberId] });
      queryClient.invalidateQueries({ queryKey: ["memberAccounts", memberId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", memberId] });
    },
  });
};

export const useGetMemberById = (memberId: string) => {
  return useQuery({
    queryKey: ["member", memberId],
    queryFn: () => membersService.getMemberById(memberId),
    enabled: !!memberId,
  });
};

export const useGetMembers = () => {
  return useQuery({
    queryKey: ["members"],
    queryFn: membersService.getMembers,
  });
}
