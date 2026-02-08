import api from "@/lib/api";

interface NextOfKin {
  id: number;
  name: string;
  relationship: string;
  phone_number: string;
  national_id: string;
}

interface Employment {
  id: number;
  employment_type: "EMPLOYED" | "SELF_EMPLOYED" | "UNEMPLOYED" | "BUSINESS";
  employer_name: string | null;
  job_title: string | null;
  monthly_income: number | null;
  business_name: string | null;
  business_type: string | null;
}

interface KycDocument {
  id: number;
  document_type: "NATIONAL_ID" | "PASSPORT_PHOTO" | "SIGNATURE";
  file: string;
  verified: boolean;
  verified_by: string;
}

export interface CustomerProps {
  id: string;
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
  next_of_kin: NextOfKin[];
  employment: Employment;
  kyc_documents: KycDocument[];
}

export const customersService = {
  getCustomers: () => api.get("/members") as Promise<CustomerProps[]>,

  getCustomerById: (customerId: string) =>
    api.get(`/members/${customerId}`) as Promise<CustomerProps>,
};
