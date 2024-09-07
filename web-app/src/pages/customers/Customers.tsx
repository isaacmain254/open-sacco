// import Button from "@/components/Button";
import { useDataFetch } from "@/hooks/useDataFetch";
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
// components
import { DataTable } from "@/components/data-table";
import Spinner from "@/components/Spinner";
import LucideIcon from "@/components/LucideIcon";
// types
import { CustomerProps } from "@/types";

const columns: ColumnDef<CustomerProps>[] = [
  {
    accessorKey: "id",
    header: "Customer ID",
    cell: ({ row }) => {
      return (
        <div>
          <Link to={`/customers/view/${row.original.id}`}>
            {row.original.id}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "first_name",
    header: "First Name",
  },
  {
    accessorKey: "last_name",
    header: "last_name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  { accessorKey: "phone_number", header: "Phone Number" },
  {
    accessorKey: "id_number",
    header: "ID Number",
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-400 text-slate-600">
          <Link to={`/customers/edit/${row.original.id}`} >
            <LucideIcon name='Pen' size={17}/>
          </Link>
        </div>
      );
    },
  }
];

const Customers = () => {
  const { data, loading, error } = useDataFetch<CustomerProps>('customers');
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
        title="Customers"
        route="/customers/edit"
        btnTitle="Create Customer"
        data={data}
        columns={columns}
        filters="email"
      />
    </>
  );
};

export default Customers;
