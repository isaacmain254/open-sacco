// import Button from "@/components/Button";
import { DataTable } from "@/components/data-table";
// import FormInput from "@/components/FormInput";
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
// import ReactTable from "@/components/ReactTable";
// import React from "react";

type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}
const payments: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "f6a6e2f5",
    amount: 150,
    status: "success",
    email: "nike@example.com"
  },
 
]

 const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({row}) => {
      return <div><Link to={`/customers/view/${row.original.id}`}>{row.original.status}</Link></div>
    }
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
]


const Customers = () => {
  return (
<>
 <DataTable  title='Customers' route="/customers/edit"  btnTitle="Create Customer" data={payments} columns={columns} filters="email" />
</>
  )
};

export default Customers;
