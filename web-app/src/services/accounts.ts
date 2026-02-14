import api from "@/lib/api";

export interface AccountProps {
  member: string;
  product: string;
  account_number: string;
  balance: number;
  is_active: boolean;
}

export interface ProductProps {
  name: string;
}

export const accountsService = {
  getAccounts: () => api.get("/accounts") as Promise<AccountProps[]>,

  getAccountById: (accountNo: string) => api.get(`/accounts/${accountNo}`) as Promise<AccountProps>,

  getMemberAccounts: (memberId: string) =>
    api.get(`/accounts/member/${memberId}`) as Promise<AccountProps[]>,

  getProducts: () => api.get("/products") as Promise<ProductProps[]>,

  createAccount: (account: Omit<AccountProps, "account_number" | "balance">) => api.post("/accounts/", account) as Promise<AccountProps>,

  updateAccount: (account: AccountProps) => api.patch(`/accounts/${account.account_number}/`, account) as Promise<AccountProps>,
};
