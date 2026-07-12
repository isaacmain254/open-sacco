import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateLoan,
  useDocumentMutations,
  useGuarantorMutations,
  useLoan,
  useLoanAction,
  useLoanTypes,
  useUpdateLoan,
} from "@/hooks/api/loans";
import { useGetMembers } from "@/hooks/api/members";
import { LoanApplicationPayload } from "@/services/loans";

type FormValues = {
  member: string;
  loan_type: string;
  requested_amount: string;
  purpose: string;
  repayment_period_months: string;
  employer: string;
  payroll_number: string;
  gross_salary: string;
  net_salary: string;
  security_type: LoanApplicationPayload["security_type"];
  collateral_description: string;
  remarks: string;
};

const steps = [
  "Member",
  "Loan details",
  "Employment",
  "Security",
  "Documents",
  "Review",
];
const documentTypes = [
  "Loan application form",
  "National ID",
  "Payslip",
  "Bank statement",
  "Title deed",
  "Vehicle logbook",
  "Other",
];
const defaultValues: FormValues = {
  member: "",
  loan_type: "",
  requested_amount: "",
  purpose: "",
  repayment_period_months: "",
  employer: "",
  payroll_number: "",
  gross_salary: "",
  net_salary: "",
  security_type: "self_guarantee",
  collateral_description: "",
  remarks: "",
};

const LoansEdit = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [memberSearch, setMemberSearch] = useState("");
  const [guarantorSearch, setGuarantorSearch] = useState("");
  const [guarantorMember, setGuarantorMember] = useState("");
  const [guaranteedAmount, setGuaranteedAmount] = useState("");
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: application, isLoading: loadingApplication } = useLoan(loanId);
  const { data: members = [] } = useGetMembers();
  const { data: loanTypes = [] } = useLoanTypes();
  const createLoan = useCreateLoan();
  const updateLoan = useUpdateLoan();
  const action = useLoanAction();
  const documents = useDocumentMutations();
  const guarantors = useGuarantorMutations();
  const form = useForm<FormValues>({ defaultValues });
  const selectedLoanTypeId = form.watch("loan_type");
  const selectedMemberId = form.watch("member");
  const securityType = form.watch("security_type");
  const selectedType = useMemo(
    () => loanTypes.find((item) => String(item.id) === selectedLoanTypeId),
    [loanTypes, selectedLoanTypeId],
  );
  const matchingMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    if (!query) return [];
    return members.filter((member) =>
      [
        member.membership_number,
        member.first_name,
        member.middle_name,
        member.last_name,
        member.national_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [memberSearch, members]);
  const selectedMember = useMemo(
    () =>
      members.find((member) => member.membership_number === selectedMemberId),
    [members, selectedMemberId],
  );
  const matchingGuarantors = useMemo(() => {
    const query = guarantorSearch.trim().toLowerCase();
    if (!query) return [];
    const addedGuarantors = new Set(application?.guarantors.map((item) => item.member) || []);
    return members.filter((member) =>
      member.membership_number !== selectedMemberId &&
      !addedGuarantors.has(member.membership_number) &&
      [member.membership_number, member.first_name, member.middle_name, member.last_name, member.national_id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [application?.guarantors, guarantorSearch, members, selectedMemberId]);
  const needsCollateral =
    securityType === "collateral" || securityType === "mixed";
  const needsGuarantors =
    securityType === "guarantors" ||
    securityType === "mixed" ||
    Boolean(selectedType?.requires_guarantors);
  const requestedAmount = Number(form.watch("requested_amount"));
  const repaymentPeriod = Number(form.watch("repayment_period_months"));
  const purpose = form.watch("purpose");
  const collateralDescription = form.watch("collateral_description");
  const isDraftReady = Boolean(
    selectedMemberId &&
      selectedType &&
      Number.isFinite(requestedAmount) &&
      requestedAmount >= Number(selectedType.min_amount) &&
      requestedAmount <= Number(selectedType.max_amount) &&
      Number.isInteger(repaymentPeriod) &&
      repaymentPeriod >= 1 &&
      repaymentPeriod <= selectedType.max_term_months &&
      purpose.trim() &&
      (!needsCollateral || collateralDescription.trim()),
  );

  useEffect(() => {
    if (!application) return;
    form.reset({
      member: application.member,
      loan_type: String(application.loan_type),
      requested_amount: String(application.requested_amount),
      purpose: application.purpose,
      repayment_period_months: String(application.repayment_period_months),
      employer: application.employer || "",
      payroll_number: application.payroll_number || "",
      gross_salary: application.gross_salary?.toString() || "",
      net_salary: application.net_salary?.toString() || "",
      security_type: application.security_type,
      collateral_description: application.collateral_description || "",
      remarks: application.remarks || "",
    });
  }, [application, form]);

  const draft = !application || application.status === "draft";
  const toPayload = (values: FormValues): LoanApplicationPayload => ({
    member: values.member,
    loan_type: Number(values.loan_type),
    requested_amount: Number(values.requested_amount),
    purpose: values.purpose,
    repayment_period_months: Number(values.repayment_period_months),
    employer: values.employer,
    payroll_number: values.payroll_number,
    gross_salary: values.gross_salary ? Number(values.gross_salary) : null,
    net_salary: values.net_salary ? Number(values.net_salary) : null,
    security_type: values.security_type,
    collateral_description:
      values.security_type === "collateral" || values.security_type === "mixed"
        ? values.collateral_description
        : "",
    remarks: values.remarks,
  });

  const saveDraft = form.handleSubmit(async (values) => {
    if (!isDraftReady) {
      toast.error("Complete all required fields before saving the draft.");
      return;
    }
    try {
      const loan = loanId
        ? await updateLoan.mutateAsync({
            applicationNumber: loanId,
            payload: toPayload(values),
          })
        : await createLoan.mutateAsync(toPayload(values));
      toast.success("Loan application saved as draft.");
      navigate(`/loans/edit/${loan.application_number}`, { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(
        error,
        "Unable to save the loan application. Check the required fields and loan-type limits.",
      ));
    }
  });

  const submitApplication = async () => {
    if (!loanId)
      return toast.info(
        "Save the application as a draft before submitting it.",
      );
    try {
      await action.mutateAsync({ action: "submit", applicationNumber: loanId });
      toast.success("Loan application submitted for review.");
      navigate(`/loans/view/${loanId}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to submit this application."));
    }
  };

  const uploadDocument = async () => {
    if (!loanId)
      return toast.info(
        "Save the draft before uploading supporting documents.",
      );
    if (!file) return toast.error("Choose a document to upload.");
    try {
      await documents.upload.mutateAsync({
        applicationNumber: loanId,
        documentType,
        file,
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Document uploaded.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to upload the document."));
    }
  };

  const addGuarantor = async () => {
    if (!loanId || !guarantorMember || Number(guaranteedAmount) <= 0) {
      toast.error("Select a guarantor and enter a guaranteed amount.");
      return;
    }
    try {
      await guarantors.add.mutateAsync({
        applicationNumber: loanId,
        member: guarantorMember,
        guaranteedAmount: Number(guaranteedAmount),
      });
      setGuarantorSearch("");
      setGuarantorMember("");
      setGuaranteedAmount("");
      toast.success("Guarantor added.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to add this guarantor."));
    }
  };

  const removeGuarantor = async (guarantorId: number) => {
    if (!loanId) return;
    try {
      await guarantors.remove.mutateAsync({ applicationNumber: loanId, guarantorId });
      toast.success("Guarantor removed.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to remove this guarantor."));
    }
  };

  if (loanId && loadingApplication)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  if (application && !draft)
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-medium">
          This application is no longer editable.
        </h1>
        <Button onClick={() => navigate(`/loans/view/${loanId}`)}>
          View application
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link className="text-sm text-blue-700 underline" to="/loans">
          ← Loan applications
        </Link>
        <h1 className="mt-2 text-2xl font-medium">
          {loanId ? "Edit loan application" : "New loan application"}
        </h1>
        <p className="text-sm text-slate-500">
          Enter the details from the member’s physical loan form, then save the
          completed application as a draft.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
        {steps.map((label, index) => (
          <Button
            key={label}
            type="button"
            variant={step === index ? "default" : "outline"}
            size="sm"
            onClick={() => setStep(index)}
          >
            {index + 1}. {label}
          </Button>
        ))}
      </div>
      <form
        onSubmit={saveDraft}
        className="rounded-lg bg-gray-100/70 p-5 dark:bg-blue-900/40"
      >
        {step === 0 && (
          <section className="space-y-4">
            <h2 className="font-medium">1. Member selection</h2>
            <input
              type="hidden"
              {...form.register("member", { required: true })}
            />
            <label className="block text-sm">
              Find member
              <Input
                className="mt-1"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Search membership number, name, or national ID"
              />
            </label>
            {selectedMember && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                <span className="font-medium">Selected member: </span>
                {selectedMember.first_name} {selectedMember.last_name}{" "}
                <span className="text-blue-700">
                  ({selectedMember.membership_number})
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() =>
                    form.setValue("member", "", { shouldValidate: true })
                  }
                >
                  Change
                </Button>
              </div>
            )}
            <div className="rounded-md border bg-white text-slate-900">
              <div className="border-b px-3 py-2 text-sm text-slate-500">
                {memberSearch.trim()
                  ? `${matchingMembers.length} matching member${matchingMembers.length === 1 ? "" : "s"}`
                  : "Search for a member to see results"}
              </div>
              <div className="max-h-72 divide-y overflow-y-auto">
                {!memberSearch.trim() ? (
                  <p className="px-3 py-6 text-sm text-slate-500">
                    Enter a name, national ID, or membership number to search.
                  </p>
                ) : matchingMembers.length ? (
                  matchingMembers.map((member) => (
                    <button
                      key={member.membership_number}
                      type="button"
                      className={`flex w-full items-center justify-between gap-4 px-3 py-3 text-left hover:bg-slate-50 ${selectedMemberId === member.membership_number ? "bg-blue-50" : ""}`}
                      onClick={() =>
                        form.setValue("member", member.membership_number, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <span>
                        <span className="block font-medium">
                          {member.first_name} {member.middle_name}{" "}
                          {member.last_name}
                        </span>
                        <span className="block text-sm text-slate-500">
                          {member.membership_number} · ID {member.national_id}
                        </span>
                      </span>
                      {selectedMemberId === member.membership_number && (
                        <span className="text-sm font-medium text-blue-700">
                          Selected
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-6 text-sm text-slate-500">
                    No members match this search.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
        {step === 1 && (
          <section className="grid gap-4 md:grid-cols-2">
            <h2 className="col-span-full font-medium">2. Loan details</h2>
            <label className="text-sm">
              Loan type
              <select
                className="mt-1 h-10 w-full rounded border bg-white px-3 text-slate-900"
                {...form.register("loan_type", { required: true })}
              >
                <option value="">Select loan type</option>
                {loanTypes
                  .filter((type) => type.is_active)
                  .map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} — {type.interest_rate}%
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-sm">
              Requested amount
              <Input
                className="mt-1"
                type="number"
                min={selectedType?.min_amount || 1}
                max={selectedType?.max_amount}
                {...form.register("requested_amount", { required: true })}
              />
            </label>
            <label className="text-sm">
              Repayment period (months)
              <Input
                className="mt-1"
                type="number"
                min="1"
                max={selectedType?.max_term_months}
                {...form.register("repayment_period_months", {
                  required: true,
                })}
              />
            </label>
            <label className="text-sm md:col-span-2">
              Purpose
              <textarea
                className="mt-1 min-h-24 w-full rounded border p-3 text-slate-900"
                {...form.register("purpose", { required: true })}
              />
            </label>
            {selectedType && (
              <p className="rounded bg-white/70 p-3 text-sm text-slate-600 md:col-span-2">
                Amount: {Number(selectedType.min_amount).toLocaleString()}–
                {Number(selectedType.max_amount).toLocaleString()} · Maximum
                term: {selectedType.max_term_months} months · Multiplier:{" "}
                {selectedType.multiplier}×
                {selectedType.requires_guarantors
                  ? " · Guarantors required"
                  : ""}
              </p>
            )}
          </section>
        )}
        {step === 2 && (
          <section className="grid gap-4 md:grid-cols-2">
            <h2 className="col-span-full font-medium">3. Employment details</h2>
            <p className="col-span-full text-sm text-slate-500">
              Provide salary details when available so the two-thirds salary
              guideline can be assessed.
            </p>
            <label className="text-sm">
              Employer
              <Input className="mt-1" {...form.register("employer")} />
            </label>
            <label className="text-sm">
              Payroll number
              <Input className="mt-1" {...form.register("payroll_number")} />
            </label>
            <label className="text-sm">
              Gross salary
              <Input
                className="mt-1"
                type="number"
                min="0"
                {...form.register("gross_salary")}
              />
            </label>
            <label className="text-sm">
              Net salary
              <Input
                className="mt-1"
                type="number"
                min="0"
                {...form.register("net_salary")}
              />
            </label>
          </section>
        )}
        {step === 3 && (
          <section className="grid gap-4 md:grid-cols-2">
            <h2 className="col-span-full font-medium">4. Security</h2>
            <label className="text-sm">
              Security type
              <select
                className="mt-1 h-10 w-full rounded border bg-white px-3 text-slate-900"
                {...form.register("security_type")}
              >
                <option value="self_guarantee">Self guarantee</option>
                <option value="guarantors">Guarantors</option>
                <option value="collateral">Collateral</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
            {needsCollateral && (
              <label className="text-sm md:col-span-2">
                Collateral description
                <textarea
                  className="mt-1 min-h-20 w-full rounded border p-3 text-slate-900"
                  placeholder="Describe the pledged asset"
                  {...form.register("collateral_description", {
                    required: needsCollateral,
                  })}
                />
              </label>
            )}
            {needsGuarantors ? (
              <div className="space-y-3 rounded-md border bg-white/70 p-4 text-slate-900 md:col-span-2">
                <div>
                  <h3 className="font-medium">Guarantors</h3>
                  <p className="text-sm text-slate-500">Total guaranteed amount is assessed as a warning; it does not automatically reject the application.</p>
                </div>
                {!loanId ? (
                  <p className="rounded bg-amber-50 p-3 text-sm text-amber-950">Save the completed application as a draft first, then add guarantors here.</p>
                ) : <>
                  <div className="space-y-2 text-sm">
                    {application?.guarantors.length ? application.guarantors.map((guarantor) => (
                      <div key={guarantor.id} className="flex items-center justify-between gap-3 rounded border px-3 py-2">
                        <span>{guarantor.member_name} · {Number(guarantor.guaranteed_amount).toLocaleString()}</span>
                        <Button type="button" size="sm" variant="ghost" disabled={guarantors.remove.isPending} onClick={() => removeGuarantor(guarantor.id)}>Remove</Button>
                      </div>
                    )) : <p className="text-slate-500">No guarantors added yet.</p>}
                  </div>
                  <label className="block text-sm">Find guarantor<Input className="mt-1" value={guarantorSearch} onChange={(event) => setGuarantorSearch(event.target.value)} placeholder="Search name, national ID, or membership number" /></label>
                  {guarantorSearch.trim() && <div className="max-h-44 divide-y overflow-y-auto rounded border">{matchingGuarantors.length ? matchingGuarantors.map((member) => <button key={member.membership_number} type="button" className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 ${guarantorMember === member.membership_number ? "bg-blue-50" : ""}`} onClick={() => setGuarantorMember(member.membership_number)}><span><span className="block font-medium">{member.first_name} {member.last_name}</span><span className="text-slate-500">{member.membership_number} · ID {member.national_id}</span></span>{guarantorMember === member.membership_number && <span className="text-blue-700">Selected</span>}</button>) : <p className="px-3 py-4 text-sm text-slate-500">No eligible members match this search.</p>}</div>}
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]"><Input type="number" min="1" placeholder="Guaranteed amount" value={guaranteedAmount} onChange={(event) => setGuaranteedAmount(event.target.value)} /><Button type="button" disabled={!guarantorMember || Number(guaranteedAmount) <= 0 || guarantors.add.isPending} onClick={addGuarantor}>Add guarantor</Button></div>
                </>}
              </div>
            ) : <p className="text-sm text-slate-500 md:col-span-2">Self-guarantee eligibility is assessed against the member’s current deposits.</p>}
          </section>
        )}
        {step === 4 && (
          <section className="space-y-4">
            <h2 className="font-medium">5. Supporting documents</h2>
            {loanId ? (
              <>
                <div className="space-y-2 text-sm">
                  {application?.documents.length ? (
                    application.documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <a
                          className="text-blue-700 underline"
                          href={document.file}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {document.document_type}
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={documents.remove.isPending}
                          onClick={() =>
                            documents.remove.mutate({
                              applicationNumber: loanId,
                              documentId: document.id,
                            })
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">No documents uploaded yet.</p>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
                  <select
                    className="h-10 rounded border bg-white px-3 text-slate-900"
                    value={documentType}
                    onChange={(event) => setDocumentType(event.target.value)}
                  >
                    {documentTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(event) =>
                      setFile(event.target.files?.[0] || null)
                    }
                  />
                  <Button
                    type="button"
                    onClick={uploadDocument}
                    disabled={documents.upload.isPending}
                  >
                    Upload
                  </Button>
                </div>
              </>
            ) : (
              <p className="rounded bg-amber-50 p-3 text-sm text-amber-950">
                Save the complete application as a draft first, then return to
                this step to upload one or more supporting documents.
              </p>
            )}
          </section>
        )}
        {step === 5 && (
          <section className="space-y-3">
            <h2 className="font-medium">6. Review and submit</h2>
            <label className="block text-sm">
              Remarks
              <textarea
                className="mt-1 min-h-24 w-full rounded border p-3 text-slate-900"
                {...form.register("remarks")}
              />
            </label>
            <p className="text-sm text-slate-500">
              Submitting locks the application and sends it to management for
              review. Eligibility checks show warnings and do not automatically
              reject an application.
            </p>
          </section>
        )}
        <div className="mt-6 flex flex-wrap justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
          >
            Back
          </Button>
          <div className="flex gap-2">
            {step < steps.length - 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((value) => value + 1)}
              >
                Next
              </Button>
            )}
          <span
            className={
              !isDraftReady || createLoan.isPending || updateLoan.isPending
                ? "cursor-not-allowed"
                : undefined
            }
          >
            <Button
              type="submit"
              disabled={!isDraftReady || createLoan.isPending || updateLoan.isPending}
            >
              Save draft
            </Button>
          </span>
            {step === steps.length - 1 && loanId && (
              <Button
                type="button"
                variant="secondary"
                disabled={action.isPending}
                onClick={submitApplication}
              >
                Submit for review
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoansEdit;
