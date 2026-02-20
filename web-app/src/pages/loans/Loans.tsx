import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";

// import { useDataFetch } from "@/hooks/useDataFetch";
// componnts
// import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/data-table";
import LucideIcon from "@/components/LucideIcon";
// types
import { LoanProps } from "@/types";


const columns: ColumnDef<LoanProps>[] = [
  {
    header: "Customer ID",
    cell: ({ row }) => {
      return (
        <div>
          <Link to={`/loans/view/${row.original.loan_id}`}>
            {row.original.account}
          </Link>
        </div>
      );
    },
  },
  {
    header: "Loan Type",
    accessorKey: "loan_type",
  },
  {
    header: "Amount",
    accessorKey: "amount",
  },
  {
    header: "Balance",
    accessorKey: "loan_balance",
  },
  {
    header: "Status",
    accessorKey: "loan_status",
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div>
          <Link to={`/loans/edit/${row.original.loan_id}`}>
            <LucideIcon name="Pen" size={18} />{" "}
          </Link>
        </div>
      );
    },
  },
];

const Loans = () => {
  //TODO: Update with data from API
  const data: LoanProps[] = []
  // const { data, loading, error } = useDataFetch<LoanProps>("loans");
  // Show loading indicator when loading
  // if (loading)
  //   return (
  //     <div className="w-full min-h-screen flex justify-center items-center">
  //       <Spinner />
  //     </div>
  //   );

  // handling error
  // if (error)
  //   return (
  //     <div className="w-full min-h-screen flex justify-center items-center">
  //       Error : {error.message}
  //     </div>
  //   );
  return (
    <>
      <DataTable
        title="Loans"
        btnTitle="Apply Loan"
        route="/loans/edit"
        columns={columns}
        data={data}
        filters="account"
      />
    </>
  );
};

export default Loans;
