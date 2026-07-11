import { AccountProps, accountsService } from "@/services/accounts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetAccounts = () => {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: accountsService.getAccounts
  });
};

export const useGetAccountById = (accountNo: string) => {
  return useQuery({
    queryKey: ["account", accountNo],
    queryFn: () => accountsService.getAccountById(accountNo),
    enabled: !!accountNo
  });
}

export const useGetMemberAccounts = (memberId: string) => {
  return useQuery({
    queryKey: ["memberAccounts", memberId],
    queryFn: () => accountsService.getMemberAccounts(memberId),
    enabled: !!memberId
  });
}

export const useGetProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: accountsService.getProducts
  });
}

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsService.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["memberAccounts"] });
    },
  });
}

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({accountNo, data}: {accountNo: string, data: Partial<AccountProps>}) => accountsService.updateAccount(accountNo, data),
    onSuccess: (_, { accountNo }) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account", accountNo] });
      queryClient.invalidateQueries({ queryKey: ["memberAccounts"] });
    },
  });
} 
