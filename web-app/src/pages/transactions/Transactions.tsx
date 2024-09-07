import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { useDataFetch } from "@/hooks/useDataFetch";
// components
import { DataTable } from "@/components/data-table";
import Spinner from "@/components/Spinner";
// types
import { TransactionProps } from "@/types";

const columns: ColumnDef<TransactionProps>[] = [
  {
    header: "Customer ID",
    cell: ({ row }) => {
      return (
        <div>
          <Link to={`/customers/view/${row.original.transaction_id}`}>
            {row.original.transaction_id}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "account",
    header: "Account",
  },
  {
    accessorKey: "transaction_type",
    header: "Transaction Type",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "transaction_date",
    header: "Transaction Date",
  },
];

const Transactions = () => {
  const { data, loading, error } =
    useDataFetch<TransactionProps>("transactions");
  // Show loading indicator when loading
  if (loading)
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
        route="/transactions/edit"
        btnTitle="Create Transaction"
        data={data}
        columns={columns}
        filters="account"
      />
    </>
  );
};

export default Transactions;
