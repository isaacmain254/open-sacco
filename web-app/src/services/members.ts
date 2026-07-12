import api from "@/lib/api";

interface NextOfKin {
  name?: string;
  relationship?: string;
  phone_number?: string;
  national_id?: string;
}

interface Employment {
  employment_type: "EMPLOYED" | "SELF_EMPLOYED" | "UNEMPLOYED" | "BUSINESS";
  employer_name?: string;
  job_title?: string;
  monthly_income?: number;
  business_name?: string;
  business_type?: string;
}

export interface KycDocument {
  document_type: "NATIONAL_ID" | "PASSPORT_PHOTO" | "SIGNATURE";
  file: string;
  verified: boolean;
  verified_by?: string;
}

export interface MemberProps {
  membership_number: string;
  salutation: "Mr" | "Mrs" | "MS" | "Dr" | "Prof" | "Rev";
  first_name: string;
  middle_name: string;
  last_name: string;
  national_id: string;
  phone_number: string;
  email: string;
  date_of_birth: string;
  kra_pin: string;
  country: string;
  county: string;
  city: string;
  status: "Active" | "Closed" | "Dormant" | "Suspended" | "Pending";
  next_of_kin?: NextOfKin[];
  employment?: Employment;
  kyc_documents?: KycDocument[];
}

export const membersService = {
  getMembers: () => api.get("/members") as Promise<MemberProps[]>,

  getMemberById: (memberId: string) =>
    api.get(`/members/${memberId}`) as Promise<MemberProps>,

  createMember: (memberData: Omit<MemberProps, "membership_number">) =>
    api.post("/members/", memberData) as Promise<MemberProps>,

  updateMember: (memberId: string, memberData: Partial<MemberProps>) =>
    api.put(`/members/${memberId}/`, memberData) as Promise<MemberProps>,

  uploadKycDocument: (
    memberId: string,
    documentType: KycDocument["document_type"],
    file: File,
    verified: boolean,
  ) => {
    const data = new FormData();
    data.append("document_type", documentType);
    data.append("file", file);
    data.append("verified", String(verified));
    return api.post(`/members/${memberId}/kyc-documents/`, data) as Promise<KycDocument>;
  },
};
