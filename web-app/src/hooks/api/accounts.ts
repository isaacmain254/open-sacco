import { AccountProps, accountsService } from "@/services/accounts";
import { useQuery, useMutation } from "@tanstack/react-query";

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
  return useMutation({
    mutationFn: accountsService.createAccount
  });
}

export const useUpdateAccount = () => {
  return useMutation({
    mutationFn: ({accountNo, data}: {accountNo: string, data: Partial<AccountProps>}) => accountsService.updateAccount(accountNo, data)
  });
} 
