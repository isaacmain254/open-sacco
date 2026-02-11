import { useMutation, useQuery } from "@tanstack/react-query";
import { membersService, MemberProps } from "@/services/members";

export const useCreateMember = () => {
  return useMutation({
    mutationFn: (data: Omit<MemberProps, "id" | "membership_number">) =>
      membersService.createMember(data),
    onSuccess: (data) => {
      // Handle successful customer creation
      console.log("Member created successfully", data);
    },
  });
};

export const useUpdateMember = () => {
  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: string;
      data: Partial<MemberProps>;
    }) => membersService.updateMember(memberId, data),
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
