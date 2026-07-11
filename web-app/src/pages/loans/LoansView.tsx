import { ChangeEvent, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "@/components/Spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import { useDocumentMutations, useGuarantorMutations, useLoan, useLoanAction } from "@/hooks/api/loans";
import { useGetMembers } from "@/hooks/api/members";
import { useGetMemberAccounts } from "@/hooks/api/accounts";
import { useUserProfileInfo } from "@/hooks/useUserProfile";
import { LoanInstallment, LoanStatus } from "@/services/loans";

const labels: Record<LoanStatus, string> = { draft: "Draft", submitted: "Submitted", under_review: "Under review", approved: "Approved", rejected: "Rejected", disbursed: "Disbursed" };
const money = (value: number | null | undefined) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const LoansView = () => {
  const { loanId = "" } = useParams();
  const { data: loan, isLoading, error } = useLoan(loanId);
  const { data: members = [] } = useGetMembers();
  const { profile } = useUserProfileInfo();
  const { data: accounts = [] } = useGetMemberAccounts(loan?.member || "");
  const action = useLoanAction();
  const guarantors = useGuarantorMutations();
  const documents = useDocumentMutations();
  const [guarantorSearch, setGuarantorSearch] = useState("");
  const [guarantorMember, setGuarantorMember] = useState("");
  const [isGuarantorPickerOpen, setIsGuarantorPickerOpen] = useState(false);
  const [guaranteedAmount, setGuaranteedAmount] = useState("");
  const [documentType, setDocumentType] = useState("Loan application form");
  const [file, setFile] = useState<File | null>(null);
  const [modal, setModal] = useState<"approve" | "reject" | "disburse" | "repay" | null>(null);
  const [notes, setNotes] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [installmentNumber, setInstallmentNumber] = useState("");
  const role = profile?.role;
  const canEdit = role === "LO" || role === "AD";
  const canReview = role === "MA" || role === "OP" || role === "AD";
  const selectedGuarantor = useMemo(
    () => members.find((member) => member.membership_number === guarantorMember),
    [guarantorMember, members],
  );
  const matchingGuarantors = useMemo(() => {
    const query = guarantorSearch.trim().toLowerCase();
    if (!query) return [];
    const addedGuarantors = new Set(loan?.guarantors.map((item) => item.member) || []);
    return members.filter((member) =>
      member.membership_number !== loan?.member &&
      !addedGuarantors.has(member.membership_number) &&
      [member.membership_number, member.first_name, member.middle_name, member.last_name, member.national_id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [guarantorSearch, loan?.guarantors, loan?.member, members]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  if (error || !loan) return <div className="flex min-h-screen items-center justify-center">Loan application not found.</div>;

  const runAction = async (actionName: "submit" | "review" | "approve" | "reject" | "disburse" | "repay", payload: Record<string, string> = {}) => {
    try {
      await action.mutateAsync({ action: actionName, applicationNumber: loan.application_number, payload });
      toast.success(`Loan application ${actionName === "review" ? "moved to review" : `${actionName}d`} successfully.`);
      setModal(null); setNotes(""); setInstallmentNumber("");
    } catch { toast.error("The workflow action could not be completed."); }
  };

  const addGuarantor = async () => {
    if (!guarantorMember || !guaranteedAmount) return toast.error("Select a guarantor and enter an amount.");
    try {
      await guarantors.add.mutateAsync({ applicationNumber: loan.application_number, member: guarantorMember, guaranteedAmount: Number(guaranteedAmount) });
      setGuarantorMember(""); setGuarantorSearch(""); setGuaranteedAmount(""); toast.success("Guarantor added.");
    } catch { toast.error("Unable to add this guarantor."); }
  };

  const uploadDocument = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return toast.error("Choose a document to upload.");
    try {
      await documents.upload.mutateAsync({ applicationNumber: loan.application_number, documentType, file });
      setFile(null); event.currentTarget.reset(); toast.success("Document uploaded.");
    } catch { toast.error("Unable to upload the document."); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><Link className="text-sm text-blue-700 underline" to="/loans">← Loan applications</Link><h1 className="mt-2 text-2xl font-medium">{loan.application_number}</h1><p className="text-slate-500">{loan.member_name} · {loan.loan_type_name}</p></div><Badge>{labels[loan.status]}</Badge></div>
      <div className="flex flex-wrap gap-2">
        {loan.status === "draft" && canEdit && <><Link to={`/loans/edit/${loan.application_number}`}><Button variant="outline">Edit draft</Button></Link><Button disabled={action.isPending} onClick={() => runAction("submit")}>Submit for review</Button></>}
        {loan.status === "submitted" && canReview && <Button disabled={action.isPending} onClick={() => runAction("review")}>Start review</Button>}
        {loan.status === "under_review" && canReview && <><Button disabled={action.isPending} onClick={() => setModal("approve")}>Approve</Button><Button disabled={action.isPending} variant="destructive" onClick={() => setModal("reject")}>Reject</Button></>}
        {loan.status === "approved" && canReview && <Button disabled={action.isPending} onClick={() => setModal("disburse")}>Disburse</Button>}
        {loan.status === "disbursed" && canReview && loan.loan_account?.schedule.some((item) => !item.is_paid) && <Button disabled={action.isPending} onClick={() => setModal("repay")}>Post repayment</Button>}
      </div>
      <div className="grid gap-5 lg:grid-cols-3"><section className="rounded-lg border p-4 lg:col-span-2"><h2 className="font-medium">Loan details</h2><dl className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Requested amount</dt><dd>{money(loan.requested_amount)}</dd></div><div><dt className="text-slate-500">Repayment period</dt><dd>{loan.repayment_period_months} months</dd></div><div><dt className="text-slate-500">Purpose</dt><dd>{loan.purpose}</dd></div><div><dt className="text-slate-500">Security</dt><dd>{loan.security_type.replace(/_/g, " ")}</dd></div>{loan.collateral_description && <div className="col-span-2"><dt className="text-slate-500">Collateral</dt><dd>{loan.collateral_description}</dd></div>}<div><dt className="text-slate-500">Employer</dt><dd>{loan.employer || "—"}</dd></div><div><dt className="text-slate-500">Payroll number</dt><dd>{loan.payroll_number || "—"}</dd></div></dl></section><section className="rounded-lg border p-4"><h2 className="font-medium">Member summary</h2><dl className="mt-3 space-y-2 text-sm"><div>Member: {loan.member_summary.membership_number}</div><div>Joined: {loan.member_summary.membership_date}</div><div>Deposits: {money(loan.member_summary.deposits)}</div><div>Existing loans: {loan.member_summary.existing_loans}</div><div>Outstanding: {money(loan.member_summary.outstanding_balance)}</div></dl></section></div>
      <section className="rounded-lg border p-4"><h2 className="font-medium">Eligibility summary</h2><div className="mt-3 grid gap-3 text-sm md:grid-cols-3"><div>Membership: {loan.eligibility_summary.membership_months} months</div><div>Monthly contribution: {money(loan.eligibility_summary.monthly_contribution)}</div><div>Indicative limit: {money(loan.eligibility_summary.eligible_amount)}</div><div>Active loans: {loan.eligibility_summary.active_loans}</div><div>Guaranteed: {money(loan.eligibility_summary.total_guaranteed)}</div><div>Estimated installment: {money(loan.eligibility_summary.estimated_monthly_installment)}</div><div>Estimated interest: {money(loan.eligibility_summary.estimated_total_interest)}</div><div>Total repayment: {money(loan.eligibility_summary.estimated_total_repayable)}</div></div>{loan.eligibility_summary.warnings.length > 0 && <div className="mt-4 rounded bg-amber-100 p-3 text-sm text-amber-950"><strong>Review warnings</strong><ul className="mt-2 list-disc pl-5">{loan.eligibility_summary.warnings.map((warning) => <li key={warning.code}>{warning.message}</li>)}</ul></div>}</section>
      {loan.loan_account && <section className="rounded-lg border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-medium">Repayment schedule</h2><p className="mt-1 text-sm text-slate-500">{loan.loan_account.interest_type === "flat" ? "Flat" : "Reducing-balance"} interest at {loan.loan_account.interest_rate}%.</p></div><div className="text-right text-sm"><div>Amount repayable: <strong>{money(loan.loan_account.total_repayable)}</strong></div><div>Outstanding: <strong>{money(loan.loan_account.outstanding_balance)}</strong></div></div></div><div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"><tr><th className="px-4 py-3">Installment</th><th className="px-4 py-3">Due date</th><th className="px-4 py-3">Principal</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Amount due</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{loan.loan_account.schedule.map((item: LoanInstallment) => { const overdue = !item.is_paid && new Date(`${item.due_date}T00:00:00`) < new Date(new Date().toDateString()); return <tr key={item.installment_number} className="border-b border-slate-200/90 text-slate-700 transition-colors hover:bg-blue-50/60 last:border-0 dark:border-slate-800/90 dark:text-slate-200 dark:hover:bg-blue-950/30"><td className="px-4 py-3">{item.installment_number}</td><td className="px-4 py-3">{new Date(`${item.due_date}T00:00:00`).toLocaleDateString()}</td><td className="px-4 py-3">{money(item.principal_due)}</td><td className="px-4 py-3">{money(item.interest_due)}</td><td className="px-4 py-3 font-medium">{money(item.total_due)}</td><td className="px-4 py-3"><Badge variant={item.is_paid ? "default" : overdue ? "destructive" : "secondary"}>{item.is_paid ? `Paid${item.paid_at ? ` · ${new Date(item.paid_at).toLocaleDateString()}` : ""}` : overdue ? "Overdue" : "Due"}</Badge></td></tr>; })}</tbody></table></div></section>}
      <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-lg border p-4"><h2 className="font-medium">Guarantors</h2><div className="mt-3 space-y-2 text-sm">{loan.guarantors.length ? loan.guarantors.map((item) => <div key={item.id} className="flex justify-between gap-3"><span>{item.member_name} · {money(item.guaranteed_amount)}</span>{loan.status === "draft" && canEdit && <Button size="sm" variant="ghost" onClick={() => guarantors.remove.mutate({ applicationNumber: loan.application_number, guarantorId: item.id })}>Remove</Button>}</div>) : <p className="text-slate-500">No guarantors added.</p>}</div>{loan.status === "draft" && canEdit && <div className="mt-4 grid gap-2 sm:grid-cols-3"><div><Button className="w-full" variant="outline" onClick={() => setIsGuarantorPickerOpen(true)}>{selectedGuarantor ? `${selectedGuarantor.first_name} ${selectedGuarantor.last_name}` : "Find guarantor"}</Button>{selectedGuarantor && <button className="mt-1 text-xs text-blue-700 underline" onClick={() => setGuarantorMember("")}>Clear selection</button>}</div><Input type="number" min="1" placeholder="Guaranteed amount" value={guaranteedAmount} onChange={(event) => setGuaranteedAmount(event.target.value)} /><Button onClick={addGuarantor} disabled={!guarantorMember || !guaranteedAmount || guarantors.add.isPending}>Add guarantor</Button></div>}</section>
      <section className="rounded-lg border p-4"><h2 className="font-medium">Supporting documents</h2><div className="mt-3 space-y-2 text-sm">{loan.documents.length ? loan.documents.map((item) => <div key={item.id} className="flex justify-between gap-3"><a className="text-blue-700 underline" href={item.file} target="_blank" rel="noreferrer">{item.document_type}</a>{loan.status === "draft" && canEdit && <Button size="sm" variant="ghost" onClick={() => documents.remove.mutate({ applicationNumber: loan.application_number, documentId: item.id })}>Remove</Button>}</div>) : <p className="text-slate-500">No documents uploaded.</p>}</div>{loan.status === "draft" && canEdit && <form className="mt-4 flex flex-wrap gap-2" onSubmit={uploadDocument}><Input className="max-w-44" value={documentType} onChange={(event) => setDocumentType(event.target.value)} /><Input className="max-w-56" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} /><Button type="submit" disabled={documents.upload.isPending}>Upload</Button></form>}</section></div>
      <section className="rounded-lg border p-4"><h2 className="font-medium">History</h2><ol className="mt-3 space-y-2 text-sm">{loan.audit_log.filter((entry) => entry.at).map((entry) => <li key={entry.event}><strong className="capitalize">{entry.event.replace(/_/g, " ")}</strong> · {new Date(entry.at!).toLocaleString()} {entry.by ? `by ${entry.by}` : ""}</li>)}</ol>{loan.approval_notes && <p className="mt-3 text-sm"><strong>Approval notes:</strong> {loan.approval_notes}</p>}{loan.rejection_reason && <p className="mt-3 text-sm"><strong>Rejection reason:</strong> {loan.rejection_reason}</p>}{loan.disbursement_notes && <p className="mt-3 text-sm"><strong>Disbursement notes:</strong> {loan.disbursement_notes}</p>}</section>
      <Modal isOpen={isGuarantorPickerOpen} onClose={() => setIsGuarantorPickerOpen(false)} title="Find guarantor"><div className="space-y-3"><label className="block text-sm">Search members<Input className="mt-1" autoFocus value={guarantorSearch} onChange={(event) => setGuarantorSearch(event.target.value)} placeholder="Name, national ID, or membership number" /></label><div className="max-h-72 divide-y overflow-y-auto rounded border">{!guarantorSearch.trim() ? <p className="px-3 py-6 text-sm text-slate-500">Search by name, national ID, or membership number.</p> : matchingGuarantors.length ? matchingGuarantors.map((member) => <button key={member.membership_number} type="button" className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm hover:bg-slate-50" onClick={() => { setGuarantorMember(member.membership_number); setIsGuarantorPickerOpen(false); }}><span><span className="block font-medium">{member.first_name} {member.middle_name} {member.last_name}</span><span className="block text-slate-500">{member.membership_number} · ID {member.national_id}</span></span><span className="text-blue-700">Select</span></button>) : <p className="px-3 py-6 text-sm text-slate-500">No eligible members match this search.</p>}</div></div></Modal>
      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title={modal === "approve" ? "Approve application" : modal === "reject" ? "Reject application" : modal === "repay" ? "Post installment repayment" : "Disburse loan"}><div className="space-y-4">{(modal === "disburse" || modal === "repay") && <select className="h-10 w-full rounded border px-3 text-slate-900" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)}><option value="">Select member account</option>{accounts.filter((account) => account.is_active).map((account) => <option key={account.account_number} value={account.account_number}>{account.account_number} — balance {money(account.balance)}</option>)}</select>}{modal === "repay" && <select className="h-10 w-full rounded border px-3 text-slate-900" value={installmentNumber} onChange={(event) => setInstallmentNumber(event.target.value)}><option value="">Select unpaid installment</option>{loan.loan_account?.schedule.filter((item) => !item.is_paid).map((item) => <option key={item.installment_number} value={item.installment_number}>Installment {item.installment_number} — due {item.due_date} — {money(item.total_due)}</option>)}</select>}<textarea className="min-h-24 w-full rounded border p-3 text-slate-900" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={modal === "reject" ? "Rejection reason (required)" : modal === "repay" ? "Repayment narration (optional)" : "Notes (optional)"} /><Button disabled={action.isPending || (modal === "reject" && !notes.trim()) || ((modal === "disburse" || modal === "repay") && !accountNumber) || (modal === "repay" && !installmentNumber)} variant={modal === "reject" ? "destructive" : "default"} onClick={() => modal === "approve" ? runAction("approve", { approval_notes: notes }) : modal === "reject" ? runAction("reject", { rejection_reason: notes }) : modal === "repay" ? runAction("repay", { account_number: accountNumber, installment_number: installmentNumber, narration: notes }) : runAction("disburse", { account_number: accountNumber, disbursement_notes: notes })}>{modal === "approve" ? "Confirm approval" : modal === "reject" ? "Confirm rejection" : modal === "repay" ? "Confirm repayment" : "Confirm disbursement"}</Button></div></Modal>
    </div>
  );
};

export default LoansView;
