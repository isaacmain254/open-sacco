import {
  AccountProps,
  CustomerProps,
  LoanProps,
  TransactionProps,
} from "@/types";
import { useDataFetch } from "./useDataFetch";

export function useDashboardData() {
  const { data: customers } = useDataFetch<CustomerProps[]>("customers");
  const { data: accounts } = useDataFetch<AccountProps>("accounts");
  const { data: loans } = useDataFetch<LoanProps>("loans");
  const { data: transactions } = useDataFetch<TransactionProps>("transactions");

  const totalCustomers = customers ? customers.length : 0;

  const totalAccountBalance = accounts
    ? accounts.reduce((sum, account) => {
        return (sum += account.balance);
      }, 0)
    : 0;

  const totalLoans = loans
    ? loans.reduce((sum, loan) => (sum += loan.amount), 0)
    : 0;

  const totalWithdrawals = transactions.reduce((sum, transaction) => {
    const withdrawals = transaction.transaction_type.includes("Withdrawal");
    if (withdrawals) {
      return (sum += transaction.amount);
    }
    return sum;
  }, 0);
  return {
    totalCustomers,
    totalAccountBalance,
    totalLoans,
    totalWithdrawals,
  };
}
