import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LoanApplicationPayload,
  LoanFilters,
  loansService,
} from "@/services/loans";

const invalidateLoans = (queryClient: ReturnType<typeof useQueryClient>, applicationNumber?: string) => {
  queryClient.invalidateQueries({ queryKey: ["loans"] });
  queryClient.invalidateQueries({ queryKey: ["loan-dashboard"] });
  if (applicationNumber) queryClient.invalidateQueries({ queryKey: ["loan", applicationNumber] });
  queryClient.invalidateQueries({ queryKey: ["accounts"] });
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
};

export const useLoanTypes = () =>
  useQuery({ queryKey: ["loan-types"], queryFn: loansService.getLoanTypes });

export const useLoans = (filters: LoanFilters = {}) =>
  useQuery({ queryKey: ["loans", filters], queryFn: () => loansService.getLoans(filters) });

export const useLoanDashboard = () =>
  useQuery({ queryKey: ["loan-dashboard"], queryFn: loansService.getDashboard });

export const useLoan = (applicationNumber?: string) =>
  useQuery({
    queryKey: ["loan", applicationNumber],
    queryFn: () => loansService.getLoan(applicationNumber!),
    enabled: Boolean(applicationNumber),
  });

export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoanApplicationPayload) => loansService.createLoan(payload),
    onSuccess: (loan) => invalidateLoans(queryClient, loan.application_number),
  });
};

export const useUpdateLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationNumber, payload }: { applicationNumber: string; payload: Partial<LoanApplicationPayload> }) =>
      loansService.updateLoan(applicationNumber, payload),
    onSuccess: (loan) => invalidateLoans(queryClient, loan.application_number),
  });
};

export const useLoanAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      action,
      applicationNumber,
      payload = {},
    }: {
      action: "submit" | "review" | "approve" | "reject" | "disburse";
      applicationNumber: string;
      payload?: Record<string, string>;
    }) => {
      if (action === "submit") return loansService.submit(applicationNumber);
      if (action === "review") return loansService.review(applicationNumber);
      if (action === "approve") return loansService.approve(applicationNumber, payload.approval_notes || "");
      if (action === "reject") return loansService.reject(applicationNumber, payload.rejection_reason || "");
      return loansService.disburse(
        applicationNumber,
        payload.account_number || "",
        payload.disbursement_notes || "",
      );
    },
    onSuccess: (loan) => invalidateLoans(queryClient, loan.application_number),
  });
};

export const useGuarantorMutations = () => {
  const queryClient = useQueryClient();
  const refresh = (applicationNumber: string) => invalidateLoans(queryClient, applicationNumber);
  return {
    add: useMutation({
      mutationFn: ({ applicationNumber, member, guaranteedAmount }: { applicationNumber: string; member: string; guaranteedAmount: number }) =>
        loansService.addGuarantor(applicationNumber, member, guaranteedAmount),
      onSuccess: (_, values) => refresh(values.applicationNumber),
    }),
    remove: useMutation({
      mutationFn: ({ applicationNumber, guarantorId }: { applicationNumber: string; guarantorId: number }) =>
        loansService.removeGuarantor(applicationNumber, guarantorId),
      onSuccess: (_, values) => refresh(values.applicationNumber),
    }),
  };
};

export const useDocumentMutations = () => {
  const queryClient = useQueryClient();
  const refresh = (applicationNumber: string) => invalidateLoans(queryClient, applicationNumber);
  return {
    upload: useMutation({
      mutationFn: ({ applicationNumber, documentType, file }: { applicationNumber: string; documentType: string; file: File }) =>
        loansService.uploadDocument(applicationNumber, documentType, file),
      onSuccess: (_, values) => refresh(values.applicationNumber),
    }),
    remove: useMutation({
      mutationFn: ({ applicationNumber, documentId }: { applicationNumber: string; documentId: number }) =>
        loansService.removeDocument(applicationNumber, documentId),
      onSuccess: (_, values) => refresh(values.applicationNumber),
    }),
  };
};
