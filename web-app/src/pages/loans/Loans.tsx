import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

type Loans = {
  customerId: string
  loanId: string
  loanType: string
  amount: number
  balance: number
  status: 'Active' | 'Closed' | 'Suspended' | 'Dormant'
}

const loans:Loans[] = [
  {
    customerId: '56690780',
    loanId: '568767',
    loanType: '7576576',
    amount: 78000,
    balance: 78000,
    status: 'Active'
  },
  {
    customerId: '56690780',
    loanId: '568767',
    loanType: '7576576',
    amount: 78000,
    balance: 78000,
    status: 'Active'
  },
  {
    customerId: '56690780',
    loanId: '568767',
    loanType: '7576576',
    amount: 78000,
    balance: 78000,
    status: 'Active'
  }
]

const columns:ColumnDef<Loans>[] = [
{
  header: 'Customer Id',
  accessorKey: 'customerId'
},
{
  header: 'Loan Id',
  accessorKey: 'loanId'
},
{
  header: 'Loan Type',
  accessorKey: 'loanType'
},
{
  header: 'Ammount',
  accessorKey: 'amount'
},
 {
header: 'Balance',
accessorKey: 'balance'
},
{
  header: 'Status',
  accessorKey: 'status'
}
]

const Loans = () => {
  return(
    <>
    <DataTable title="Loans" btnTitle="Apply Loan" route="/loans/edit" columns={columns} data={loans} />
    </>
  )
};

export default Loans;
