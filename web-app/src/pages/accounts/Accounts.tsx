import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { useDataFetch } from "@/hooks/useDataFetch";

// types
import { AccountProps } from "@/types";
// components
import { DataTable } from "@/components/data-table";
import LucideIcon from "@/components/LucideIcon";
import Spinner from "@/components/Spinner";

const columns: ColumnDef<AccountProps>[] = [
  {
    accessorKey: "account_number",
    header: "Account Number",
    cell: ({ row }) => {
      return (
        <div>
          <Link to={`/accounts/view/${row.original.account_number}`}>
            {row.original.account_number}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "customer",
    header: "Customer ID",
  },
  {
    accessorKey: "account_type",
    header: "Account Type",
  },
  {
    accessorKey: "balance",
    header: "Balance",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    header: "Edit",
    cell: ({ row }) => {
      return (
        <div>
          <Link to={`/accounts/edit/${row.original.account_number}`}>
            <LucideIcon name="Pen" size={18} />{" "}
          </Link>
        </div>
      );
    },
  },
];
const Accounts = () => {
  const { data, loading, error } = useDataFetch<AccountProps>("accounts");
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
        title="Accounts"
        route="/accounts/edit"
        btnTitle="Create Account"
        data={data}
        columns={columns}
        filters="account_number"
      />
    </>
  );
};

export default Accounts;
