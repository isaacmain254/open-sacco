import api from "@/lib/api";

export interface TransactionProps {
  id: string;
  account: string;
  transaction_type: string;
  amount: number;
  reference: string;
  narration: string;
  performed_by: string;
  created_at: string;
  account_number: string;
  performed_by_username: string;
}

export const transactionsService = {
  getTransactions: () =>
    api.get("/transactions") as Promise<TransactionProps[]>,

  

  postTransaction: (
    payload: Omit<
      TransactionProps,
      "id" | "reference" | "created_at" | "performed_by" | "account_number" | "performed_by_username"
    >,
  ) => api.post("/transactions/", payload) as Promise<TransactionProps>,

  getMemberTransactions: (member_id: string) =>
    api.get(`/transactions/member/${member_id}`) as Promise<TransactionProps[]>,
};

