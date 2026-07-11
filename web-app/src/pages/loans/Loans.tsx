import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { DataTable } from "@/components/data-table";
import Spinner from "@/components/Spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLoanDashboard, useLoans } from "@/hooks/api/loans";
import { LoanApplicationListItem, LoanStatus } from "@/services/loans";
import { useUserProfileInfo } from "@/hooks/useUserProfile";

const statusLabels: Record<LoanStatus, string> = {
  draft: "Draft", submitted: "Submitted", under_review: "Under review",
  approved: "Approved", rejected: "Rejected", disbursed: "Disbursed",
};

const statusVariant = (status: LoanStatus) =>
  status === "rejected" ? "destructive" : status === "approved" || status === "disbursed" ? "default" : "secondary";

const Loans = () => {
  const [status, setStatus] = useState<LoanStatus | "">("");
  const { data: dashboard } = useLoanDashboard();
  const { data: loans = [], isLoading, error } = useLoans({ status });
  const { profile } = useUserProfileInfo();
  const canCreate = profile?.role === "LO" || profile?.role === "AD";

  const columns = useMemo<ColumnDef<LoanApplicationListItem>[]>(() => [
    {
      header: "Application",
      accessorKey: "application_number",
      filterFn: (row, _columnId, value) => {
        const search = String(value || "").trim().toLowerCase();
        if (!search) return true;
        return [
          row.original.application_number,
          row.original.member_name,
          row.original.member_number,
          row.original.member_national_id,
        ].some((field) => field.toLowerCase().includes(search));
      },
      cell: ({ row }) => <Link className="text-blue-700 underline" to={`/loans/view/${row.original.application_number}`}>{row.original.application_number}</Link>,
    },
    { header: "Member", accessorKey: "member_name", cell: ({ row }) => <div>{row.original.member_name}<small className="block text-slate-500">{row.original.member_number}</small></div> },
    { header: "Loan type", accessorKey: "loan_type_name" },
    { header: "Amount", accessorKey: "requested_amount", cell: ({ row }) => Number(row.original.requested_amount).toLocaleString() },
    { header: "Status", accessorKey: "status", cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{statusLabels[row.original.status]}</Badge> },
    { header: "Loan officer", accessorKey: "loan_officer" },
    { header: "Approver", accessorKey: "approver", cell: ({ row }) => row.original.approver || "—" },
    {
      header: "Action",
      cell: ({ row }) => (
        <Link className="text-blue-700 underline" to={row.original.status === "draft" && canCreate ? `/loans/edit/${row.original.application_number}` : `/loans/view/${row.original.application_number}`}>
          {row.original.status === "draft" && canCreate ? "Edit draft" : "View"}
        </Link>
      ),
    },
  ], [canCreate]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  if (error) return <div className="flex min-h-screen items-center justify-center">Unable to load loan applications.</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-medium">Loan applications</h1>
        <p className="mt-1 text-sm text-slate-500">Track, review, and process member loan applications.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Object.entries(dashboard?.counts || {}).map(([key, count]) => (
          <Button key={key} variant={status === key ? "default" : "outline"} className="h-auto flex-col items-start" onClick={() => setStatus(status === key ? "" : key as LoanStatus)}>
            <span className="text-lg">{count}</span><span className="text-xs">{statusLabels[key as LoanStatus]}</span>
          </Button>
        ))}
      </div>
      <DataTable btnTitle={canCreate ? "Apply loan" : undefined} route={canCreate ? "/loans/edit" : undefined} columns={columns} data={loans} filters="application_number" />
    </div>
  );
};

export default Loans;
