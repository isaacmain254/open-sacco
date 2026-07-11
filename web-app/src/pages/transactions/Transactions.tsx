import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Spinner from "@/components/Spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import { TransactionForm } from "@/components/transactions/transactionForm";
import { useGetTransactions } from "@/hooks/api/transactions";
import { formatDate } from "@/lib/utils";
import { TransactionProps } from "@/services/transactions";

const currency = (amount: number) =>
  Number(amount || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  });

const titleCase = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "—";

const Transactions = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionProps | null>(null);
  const { data: transactions = [], isLoading, error } = useGetTransactions();

  const columns = useMemo<ColumnDef<TransactionProps>[]>(() => [
    {
      accessorKey: "reference",
      header: "Transaction ID",
      filterFn: (row, _columnId, value) => {
        const query = String(value || "").trim().toLowerCase();
        if (!query) return true;
        return [
          row.original.reference,
          row.original.account_number,
          row.original.transaction_type,
          String(row.original.amount),
          row.original.narration || "",
          row.original.performed_by_username || "",
          row.original.created_at,
        ].some((field) => field.toLowerCase().includes(query));
      },
    },
    { accessorKey: "account_number", header: "Account Number" },
    {
      accessorKey: "transaction_type",
      header: "Transaction Type",
      cell: ({ row }) => <Badge variant={row.original.transaction_type === "withdrawal" ? "destructive" : "secondary"}>{titleCase(row.original.transaction_type)}</Badge>,
    },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => currency(row.original.amount) },
    {
      accessorKey: "narration",
      header: "Narration",
      cell: ({ row }) => <p className="max-w-48 truncate" title={row.original.narration || ""}>{row.original.narration || "—"}</p>,
    },
    { accessorKey: "performed_by_username", header: "Served by", cell: ({ row }) => row.original.performed_by_username || "—" },
    { accessorKey: "created_at", header: "Transaction Date", cell: ({ row }) => formatDate(row.original.created_at) },
    {
      id: "details",
      header: "Details",
      cell: ({ row }) => <Button size="sm" variant="ghost" onClick={() => setSelectedTransaction(row.original)}>View</Button>,
    },
  ], []);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  if (error) return <div className="flex min-h-screen items-center justify-center">Unable to load transactions.</div>;

  return (
    <>
      <DataTable
        title="Transactions"
        btnTitle="Create Transaction"
        data={transactions}
        columns={columns}
        onClick={() => setIsCreateModalOpen(true)}
        filters="reference"
        searchPlaceholder="Search type, account, amount, narration..."
      />
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Transaction">
        <TransactionForm onSuccess={() => setIsCreateModalOpen(false)} />
      </Modal>
      <Modal isOpen={selectedTransaction !== null} onClose={() => setSelectedTransaction(null)} title="Transaction details">
        {selectedTransaction && <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Reference</dt><dd className="mt-1 font-medium">{selectedTransaction.reference}</dd></div>
          <div><dt className="text-slate-500">Transaction type</dt><dd className="mt-1">{titleCase(selectedTransaction.transaction_type)}</dd></div>
          <div><dt className="text-slate-500">Account number</dt><dd className="mt-1">{selectedTransaction.account_number}</dd></div>
          <div><dt className="text-slate-500">Amount</dt><dd className="mt-1 font-medium">{currency(selectedTransaction.amount)}</dd></div>
          <div><dt className="text-slate-500">Processed by</dt><dd className="mt-1">{selectedTransaction.performed_by_username || "—"}</dd></div>
          <div><dt className="text-slate-500">Date and time</dt><dd className="mt-1">{formatDate(selectedTransaction.created_at)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-slate-500">Narration</dt><dd className="mt-1 whitespace-pre-wrap">{selectedTransaction.narration || "—"}</dd></div>
        </dl>}
      </Modal>
    </>
  );
};

export default Transactions;
