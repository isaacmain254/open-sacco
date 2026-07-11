import api from "@/lib/api";

export type LoanStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "disbursed";

export interface LoanType {
  id: number;
  name: string;
  interest_rate: number;
  repayment_period_months: number;
  multiplier: number;
  interest_type: "reducing" | "flat";
  min_amount: number;
  max_amount: number;
  max_term_months: number;
  requires_guarantors: boolean;
  is_active: boolean;
}

export interface LoanApplicationListItem {
  application_number: string;
  member: string;
  member_number: string;
  member_national_id: string;
  member_name: string;
  loan_type: number;
  loan_type_name: string;
  requested_amount: number;
  status: LoanStatus;
  created_at: string;
  loan_officer: string;
  approver: string | null;
}

export interface Guarantor {
  id: number;
  member: string;
  member_name: string;
  guaranteed_amount: number;
  created_at: string;
}

export interface LoanDocument {
  id: number;
  document_type: string;
  file: string;
  uploaded_by: number;
  uploaded_by_username: string;
  uploaded_at: string;
}

export interface EligibilitySummary {
  membership_date: string;
  membership_months: number;
  current_deposits: number;
  monthly_contribution: number;
  minimum_monthly_contribution: number;
  loan_multiplier: number;
  eligible_amount: number;
  active_loans: number;
  outstanding_balance: number;
  estimated_monthly_installment: number;
  two_thirds_salary_limit: number | null;
  total_guaranteed: number;
  warnings: Array<{ code: string; message: string }>;
}

export interface LoanApplication extends LoanApplicationListItem {
  purpose: string;
  repayment_period_months: number;
  employer: string;
  payroll_number: string;
  gross_salary: number | null;
  net_salary: number | null;
  security_type: "self_guarantee" | "guarantors" | "collateral" | "mixed";
  collateral_description: string;
  remarks: string;
  created_by: number;
  submitted_by: number | null;
  reviewed_by: number | null;
  approved_by: number | null;
  rejected_by: number | null;
  disbursed_by: number | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  disbursed_at: string | null;
  approval_notes: string;
  rejection_reason: string;
  disbursement_notes: string;
  eligibility_warnings: Array<{ code: string; message: string }>;
  eligibility_summary: EligibilitySummary;
  guarantors: Guarantor[];
  documents: LoanDocument[];
  member_summary: {
    membership_number: string;
    name: string;
    membership_date: string;
    deposits: number;
    existing_loans: number;
    outstanding_balance: number;
  };
  audit_log: Array<{ event: string; at: string | null; by: string | null }>;
}

export interface LoanApplicationPayload {
  member: string;
  loan_type: number;
  requested_amount: number;
  purpose: string;
  repayment_period_months: number;
  employer?: string;
  payroll_number?: string;
  gross_salary?: number | null;
  net_salary?: number | null;
  security_type: LoanApplication["security_type"];
  collateral_description?: string;
  remarks?: string;
}

export interface LoanFilters {
  status?: LoanStatus | "";
  search?: string;
  loan_type?: number | "";
  member?: string;
  date_from?: string;
  date_to?: string;
}

const queryString = (filters: LoanFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : "";
};

export const loansService = {
  getLoanTypes: () => api.get("/loan-types/") as Promise<LoanType[]>,
  getLoans: (filters?: LoanFilters) =>
    api.get(`/loans/${queryString(filters)}`) as Promise<LoanApplicationListItem[]>,
  getDashboard: () =>
    api.get("/loans/dashboard/") as Promise<{
      counts: Record<LoanStatus, number>;
      recent_applications: LoanApplicationListItem[];
    }>,
  getLoan: (applicationNumber: string) =>
    api.get(`/loans/${applicationNumber}/`) as Promise<LoanApplication>,
  createLoan: (payload: LoanApplicationPayload) =>
    api.post("/loans/", payload) as Promise<LoanApplication>,
  updateLoan: (applicationNumber: string, payload: Partial<LoanApplicationPayload>) =>
    api.patch(`/loans/${applicationNumber}/`, payload) as Promise<LoanApplication>,
  submit: (applicationNumber: string) =>
    api.post(`/loans/${applicationNumber}/submit/`, {}) as Promise<LoanApplication>,
  review: (applicationNumber: string) =>
    api.post(`/loans/${applicationNumber}/review/`, {}) as Promise<LoanApplication>,
  approve: (applicationNumber: string, approval_notes: string) =>
    api.post(`/loans/${applicationNumber}/approve/`, { approval_notes }) as Promise<LoanApplication>,
  reject: (applicationNumber: string, rejection_reason: string) =>
    api.post(`/loans/${applicationNumber}/reject/`, { rejection_reason }) as Promise<LoanApplication>,
  disburse: (applicationNumber: string, account_number: string, disbursement_notes: string) =>
    api.post(`/loans/${applicationNumber}/disburse/`, { account_number, disbursement_notes }) as Promise<LoanApplication>,
  addGuarantor: (applicationNumber: string, member: string, guaranteed_amount: number) =>
    api.post(`/loans/${applicationNumber}/guarantors/`, { member, guaranteed_amount }) as Promise<Guarantor>,
  removeGuarantor: (applicationNumber: string, guarantorId: number) =>
    api.delete(`/loans/${applicationNumber}/guarantors/${guarantorId}/`) as Promise<void>,
  uploadDocument: (applicationNumber: string, documentType: string, file: File) => {
    const data = new FormData();
    data.append("document_type", documentType);
    data.append("file", file);
    // Let the browser add the multipart boundary. Setting this header ourselves
    // can produce an unreadable upload on some Axios/browser combinations.
    return api.post(`/loans/${applicationNumber}/documents/`, data) as Promise<LoanDocument>;
  },
  removeDocument: (applicationNumber: string, documentId: number) =>
    api.delete(`/loans/${applicationNumber}/documents/${documentId}/`) as Promise<void>,
};
