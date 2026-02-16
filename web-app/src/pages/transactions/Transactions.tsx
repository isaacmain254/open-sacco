import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";

// components
import { DataTable } from "@/components/data-table";
import Spinner from "@/components/Spinner";
// hooks
import { useGetTransactions } from "@/hooks/api/transactions";
// types
import { TransactionProps } from "@/services/transactions";
// utils
import { formatDate } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { TransactionForm } from "@/components/transactions/transactionForm";

const columns: ColumnDef<TransactionProps>[] = [
  {
    header: "Transaction ID",
    cell: ({ row }) => {
      return (
        <div>
          <Link to={`/customers/view/${row.original.id}`}>
            {row.original.reference}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "account_number",
    header: "Account Number",
  },
  {
    accessorKey: "transaction_type",
    header: "Transaction Type",
    cell: ({ row }) => {
      return (
        <div>
          {row.original.transaction_type.toUpperCase()}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "performed_by_username",
    header: "Sevrved By",
  },
  {
    accessorKey: "created_at",
    header: "Transaction Date",
    cell: ({ row }) => {
      return (
        <div>
          {formatDate(row.original.created_at)}
        </div>
      );
    },
  },
];

const Transactions = () => {
  const [openModal, setOpenModal] = useState(false)
const {data: transactions, isLoading, error}  = useGetTransactions()

  if (isLoading)
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );

  // handling error
  if (error)
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        Error : {error.message}
      </div>
    );
  return (
    <>
      <DataTable
        title="Transactions"
        // route="/transactions/edit"
        btnTitle="Create Transaction"
        data={transactions ?? []}
        columns={columns}
        onClick={() => {setOpenModal(true)}}
        filters="account"
        
      />
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Create Transaction"
      >
        <TransactionForm />
      </Modal>
    </>
  );
};

export default Transactions;
