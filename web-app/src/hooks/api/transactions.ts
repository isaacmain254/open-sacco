import { TransactionProps, transactionsService } from "@/services/transactions";
import { useMutation, useQuery } from "@tanstack/react-query";


export const useGetTransactions = () => {
    return useQuery({
        queryKey: ["transactions"],
        queryFn: () => transactionsService.getTransactions(),
    });
}

export const usePostTransaction = () => {
    return useMutation({
        mutationFn: (payload: Omit<TransactionProps, "id" | "reference" | "created_at" | "performed_by" | "account_number">) => transactionsService.postTransaction(payload),
    });
}

export const useGetMemberTransactions = (member_id: string) => {
    return useQuery({
        queryKey: ["transactions", member_id],
        queryFn: () => transactionsService.getMemberTransactions(member_id),
    });
}