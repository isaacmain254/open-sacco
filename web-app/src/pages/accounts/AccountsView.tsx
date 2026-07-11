import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Link, useParams } from "react-router-dom";
import { DataTable } from "@/components/data-table";
import Spinner from "@/components/Spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import { TransactionForm } from "@/components/transactions/transactionForm";
import { useGetAccountById } from "@/hooks/api/accounts";
import { useGetAccountTransactions } from "@/hooks/api/transactions";
import { formatDate } from "@/lib/utils";
import { TransactionProps } from "@/services/transactions";

const currency = (amount: number) =>
  Number(amount || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  });

const transactionLabel = (type: string) =>
  type ? `${type.charAt(0).toUpperCase()}${type.slice(1)}` : "—";

const AccountsView = () => {
  const { accountNo = "" } = useParams();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const { data: account, isLoading: isAccountLoading, error: accountError } = useGetAccountById(accountNo);
  const { data: transactions = [], isLoading: areTransactionsLoading, error: transactionsError } = useGetAccountTransactions(accountNo);

  const transactionColumns = useMemo<ColumnDef<TransactionProps>[]>(() => [
    { header: "Date", accessorKey: "created_at", cell: ({ row }) => formatDate(row.original.created_at) },
    { header: "Reference", accessorKey: "reference" },
    {
      header: "Type",
      accessorKey: "transaction_type",
      cell: ({ row }) => <Badge variant={row.original.transaction_type === "withdrawal" ? "destructive" : "secondary"}>{transactionLabel(row.original.transaction_type)}</Badge>,
    },
    { header: "Amount", accessorKey: "amount", cell: ({ row }) => currency(row.original.amount) },
    { header: "Narration", accessorKey: "narration", cell: ({ row }) => row.original.narration || "—" },
    { header: "Processed by", accessorKey: "performed_by_username", cell: ({ row }) => row.original.performed_by_username || "—" },
  ], []);

  if (isAccountLoading || areTransactionsLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  }

  if (accountError || !account) {
    return <div className="flex min-h-screen items-center justify-center">Account not found.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="text-sm text-blue-700 underline" to="/accounts">← Accounts</Link>
          <h1 className="mt-2 text-2xl font-medium">Account {account.account_number}</h1>
          <p className="mt-1 text-sm text-slate-500">Account details and transaction history.</p>
        </div>
        <Button disabled={!account.is_active} onClick={() => setIsTransactionModalOpen(true)}>New transaction</Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4"><p className="text-sm text-slate-500">Current balance</p><p className="mt-1 text-xl font-semibold">{currency(account.balance)}</p></div>
        <div className="rounded-lg border p-4"><p className="text-sm text-slate-500">Account status</p><div className="mt-2"><Badge variant={account.is_active ? "default" : "destructive"}>{account.is_active ? "Active" : "Inactive"}</Badge></div></div>
        <div className="rounded-lg border p-4"><p className="text-sm text-slate-500">Product</p><p className="mt-1 font-medium">{account.product || "—"}</p></div>
        <div className="rounded-lg border p-4"><p className="text-sm text-slate-500">Member</p><Link className="mt-1 block font-medium text-blue-700 underline" to={`/members/view/${account.member}`}>{account.member}</Link></div>
      </section>

      <section className="rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-medium">Transactions</h2><p className="mt-1 text-sm text-slate-500">All deposits and withdrawals posted to this account.</p></div><span className="text-sm text-slate-500">{transactions.length} total</span></div>
        {transactionsError ? <p className="mt-4 text-sm text-red-600">Unable to load this account’s transactions.</p> : <div className="mt-2"><DataTable columns={transactionColumns} data={transactions} filters="reference" showSearch /></div>}
      </section>

      <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title={`New transaction — ${account.account_number}`}>
        <TransactionForm accountNo={account.account_number} onSuccess={() => setIsTransactionModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default AccountsView;
