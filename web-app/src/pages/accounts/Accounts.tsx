import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";

// components
import { DataTable } from "@/components/data-table";
import LucideIcon from "@/components/LucideIcon";
import Spinner from "@/components/Spinner";
import { useGetAccounts } from "@/hooks/api/accounts";
import { AccountProps } from "@/services/accounts";

const columns: ColumnDef<AccountProps>[] = [
  {
    accessorKey: "account_number",
    header: "Account Number",
    cell: ({ row }) => {
      return (
        <div className="underline">
          <Link to={`/accounts/view/${row.original.account_number}`}>
            {row.original.account_number}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "member",
    header: "Member ID",
  },
  {
    accessorKey: "product",
    header: "Product ID",
  },
  {
    accessorKey: "balance",
    header: "Balance",
  },
  {
    accessorKey: "is_active",
    header: "Active",
  },
  {
    header: "Edit",
    cell: ({ row }) => {
      return (
        <div>
          <Link to={`/accounts/edit/${row.original.account_number}`}>
            <LucideIcon name="SquarePen" size={18} />{" "}
          </Link>
        </div>
      );
    },
  },
];
const Accounts = () => {
  const { data: accounts, isLoading, error } = useGetAccounts();
  // Show loading indicator when loading
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
        title="Accounts"
        route="/accounts/edit"
        btnTitle="Create Account"
        data={accounts || []}
        columns={columns}
        filters="account_number"
      />
    </>
  );
};

export default Accounts;
