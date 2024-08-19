import { DataTable } from "@/components/data-table";
import LucideIcon from "@/components/LucideIcon";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { Link } from "react-router-dom";

type Accounts = {
  customerId: string
  accountNo: string
  accountType: string
  balance: number
  status: 'Active' | 'Closed' | 'Suspended' | 'Dormant'
}
const accounts:Accounts[] = [
  {
    customerId: '56690780',
    accountNo: '568767',
    accountType: '7576576',
    balance: 78000,
    status: 'Active'
  }
]
 const columns: ColumnDef<Accounts>[] = [
  {
    accessorKey: "customerId",
    header: "Customer Id",
    cell: ({row}) => {
      return <div><Link to={`/accounts/view/${row.original.accountNo}`}>{row.original.customerId}</Link></div>
    }
  },
  {
    accessorKey: 'accountNo',
    header: 'Account No'
  },
  {
    accessorKey: 'accountType',
    header: 'Account Type'

  },
  {
    accessorKey: 'balance',
    header: 'Balance'
  },
  {
    header: "Edit",
    cell: ({row}) => {
      return <div ><Link to={`/accounts/edit/${row.original.accountNo}`}><LucideIcon name='Pen' size={18} /> </Link></div>
    }
  }
 ]
const Accounts = () => {
  return (
 <>
 <DataTable title="Accounts" route="/accounts/edit" btnTitle="Create Account" data={accounts} columns={columns} />
</>
  );
};

export default Accounts;
