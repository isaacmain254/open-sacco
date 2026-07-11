import { TransactionProps, transactionsService } from "@/services/transactions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export const useGetTransactions = (enabled = true) => {
    return useQuery({
        queryKey: ["transactions"],
        queryFn: () => transactionsService.getTransactions(),
        enabled,
    });
}

export const usePostTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Omit<TransactionProps, "id" | "reference" | "created_at" | "performed_by" | "account" | "performed_by_username">) => transactionsService.postTransaction(payload),
        onSuccess: () => {
            // A transaction changes the transaction list and account balances.
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            queryClient.invalidateQueries({ queryKey: ["account"] });
            queryClient.invalidateQueries({ queryKey: ["memberAccounts"] });
        },
    });
}

export const useGetMemberTransactions = (member_id: string) => {
    return useQuery({
        queryKey: ["transactions", member_id],
        queryFn: () => transactionsService.getMemberTransactions(member_id),
    });
}

export const useGetAccountTransactions = (accountNumber: string) => {
    return useQuery({
        queryKey: ["transactions", "account", accountNumber],
        queryFn: () => transactionsService.getAccountTransactions(accountNumber),
        enabled: !!accountNumber,
    });
}
