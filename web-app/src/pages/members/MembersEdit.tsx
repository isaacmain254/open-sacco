import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { useNavigate, useParams } from "react-router-dom";
import { CirclePlus, CircleX } from "lucide-react";

// components
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
import Spinner from "@/components/Spinner";
// types
// import { CustomerProps } from "@/types";
import { toast } from "react-toastify";
// Hooks
import {
  useCreateMember,
  useGetMemberById,
  useUpdateMember,
} from "@/hooks/api/members";
import { membersService } from "@/services/members";
import { getApiErrorMessage } from "@/lib/utils";

// form validation - zod schemas
const nextOfKinSchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  phone_number: z.string().optional(),
  national_id: z.string().optional(),
});

const employmentSchema = z.object({
  employment_type: z.enum([
    "EMPLOYED",
    "SELF_EMPLOYED",
    "UNEMPLOYED",
    "BUSINESS",
  ]),
  employer_name: z.string().optional(),
  job_title: z.string().optional(),
  monthly_income: z
    .union([z.number(), z.string()])
    .transform((v) => (v === "" ? 0 : Number(v)))
    .optional(),
  business_name: z.string().optional(),
  business_type: z.string().optional(),
});

const kycDocumentSchema = z.object({
  document_type: z.enum(["NATIONAL_ID", "PASSPORT_PHOTO", "SIGNATURE"]),
  file: z.union([z.instanceof(File), z.string(), z.null()]),
  verified: z.boolean().default(false),
});

const formSchema = z.object({
  salutation: z.enum(["Mr", "Mrs", "MS", "Dr", "Prof", "Rev"]),

  first_name: z.string().min(1, "This field is required"),
  middle_name: z.string().min(1, "This field is required"),
  last_name: z.string().min(1, "This field is required"),

  national_id: z
    .string()
    .trim()
    .min(1, "National ID is required")
    .min(6, "National ID must be at least 6 digits")
    .max(10, "National ID must be at most 10 digits")
    .regex(/^\d+$/, "National ID must contain digits only"),

  phone_number: z.string().min(1, "This field is required"),

  email: z
    .string()
    .min(1, "This field is required")
    .email("Enter a valid email address"),

  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD"),

  kra_pin: z.string().min(1, "This field is required"),

  country: z.string().min(1, "This field is required"),
  county: z.string().min(1, "This field is required"),
  city: z.string().min(1, "This field is required"),

  status: z.enum(["Active", "Closed", "Dormant", "Suspended", "Pending"]),
  employment: employmentSchema,

  next_of_kin: z.array(nextOfKinSchema).optional(),
  kyc_documents: z.array(kycDocumentSchema).optional(),
});

type MemberFormValues = z.infer<typeof formSchema>;
type KycDocumentForm = z.infer<typeof kycDocumentSchema>;

const isNewKycDocument = (
  document: KycDocumentForm,
): document is KycDocumentForm & { file: File } => document.file instanceof File;

const MembersEdit = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [submissionAction, setSubmissionAction] = useState<
    "save" | "continue" | null
  >(null);
  const submissionActionRef = useRef<"save" | "continue">("save");
  const isSavingRef = useRef(false);

  // Get member details
  const { data: member, isLoading } = useGetMemberById(memberId!);
  // Create member mutation
  const { mutateAsync: createMember, isPending: isCreatingMember } =
    useCreateMember();
  // Update member mutation
  const { mutateAsync: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salutation: "Mr",
      first_name: "",
      middle_name: "",
      last_name: "",
      national_id: "",
      phone_number: "",
      email: "",
      date_of_birth: "",
      kra_pin: "",
      country: "",
      county: "",
      city: "",
      status: "Active",

      employment: {
        employment_type: "EMPLOYED",
        employer_name: "",
        job_title: "",
        business_name: "",
        business_type: "",
      },

      next_of_kin: [],
      kyc_documents: [],
    },
  });

  // Populate form with existing customer data for edit
  useEffect(() => {
    if (member) {
      form.reset({
        ...member,
        next_of_kin: member.next_of_kin ?? [],
        kyc_documents: member.kyc_documents ?? [],
        employment: member.employment ?? form.getValues("employment"),
      });
    }
  }, [form, member]);

  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "next_of_kin",
  });

  const {
    fields: kycFields,
    append: appendKyc,
    remove: removeKyc,
  } = useFieldArray({
    control: form.control,
    name: "kyc_documents",
  });

  const onSubmit = async (values: MemberFormValues) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    const action = memberId ? "save" : submissionActionRef.current;
    setSubmissionAction(action);
    const { kyc_documents = [], employment, ...memberDetails } = values;
    const payload = {
      ...memberDetails,
      employment: {
        ...employment,
        monthly_income: employment.monthly_income ?? 0,
      },
    };

    try {
      const savedMember = memberId
        ? await updateMember({ memberId, data: payload })
        : await createMember(payload);

      const newDocuments = kyc_documents.filter(isNewKycDocument);
      if (newDocuments.length) {
        try {
          await Promise.all(
            newDocuments.map((document) =>
              membersService.uploadKycDocument(
                savedMember.membership_number,
                document.document_type,
                document.file,
                document.verified,
              ),
            ),
          );
        } catch (error) {
          toast.error(getApiErrorMessage(error, "Member saved, but one or more KYC documents could not be uploaded."));
          return;
        }
      }

      toast.success(memberId ? "Member updated successfully" : "Member created successfully");
      if (!memberId && action === "continue") {
        form.reset();
      } else {
        navigate("/members");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, memberId ? "Failed to update member" : "Failed to create member"));
    } finally {
      isSavingRef.current = false;
      submissionActionRef.current = "save";
      setSubmissionAction(null);
    }
  };
  const employmentType = form.watch("employment.employment_type");
  const isSubmitting =
    form.formState.isSubmitting || isCreatingMember || isUpdatingMember;

  if (isLoading)
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-medium">New Member</h1>
      <Form {...form}>
        <form className="space-y-16" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Personal details */}
          <div className="my-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="w-full text-lg font-medium ">Personal Details</div>
            <Separator className="my-4 bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <FormField
                control={form.control}
                name="salutation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salutation</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => v != "" && field.onChange(v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select salutation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                        <SelectItem value="Prof">Prof</SelectItem>
                        <SelectItem value="Rev">Rev</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middle_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="national_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>National ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="34589364"
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="07XXXXXXXX"
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john.doe@example.com"
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        {...field}
                        value={field.value || ""}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kra_pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KRA PIN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="A06777S20JJD"
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => v != "" && field.onChange(v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="Dormant">Dormant</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* ADDRESS */}
          <div className="my-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="w-full text-lg font-medium ">Address</div>
            <Separator className="my-4 bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kenya"
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>County</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nairobi"
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nairobi"
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* EMPLOYMENT DETAILS */}
          <div className="my-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="w-full text-lg font-medium ">
              Employment Details
            </div>
            <Separator className="my-4 bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <FormField
                control={form.control}
                name="employment.employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EMPLOYED">Employed</SelectItem>
                        <SelectItem value="SELF_EMPLOYED">
                          Self Employed
                        </SelectItem>
                        <SelectItem value="BUSINESS">Business Owner</SelectItem>
                        <SelectItem value="UNEMPLOYED">Unemployed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {employmentType === "EMPLOYED" && (
                <>
                  <FormField
                    control={form.control}
                    name="employment.employer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Open Sacco" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employment.job_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Accountant" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {employmentType === "SELF_EMPLOYED" && (
                <FormField
                  control={form.control}
                  name="employment.job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Consultant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {employmentType === "BUSINESS" && (
                <>
                  <FormField
                    control={form.control}
                    name="employment.business_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Kinuthia Enterprises" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employment.business_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Retail" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {employmentType !== "UNEMPLOYED" && (
                <FormField
                  control={form.control}
                  name="employment.monthly_income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="KES 100,000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {employmentType === "UNEMPLOYED" && (
                <p className="self-end text-sm text-slate-500 dark:text-slate-400">
                  No employment details are required.
                </p>
              )}
            </div>
          </div>
          {/* Next Of Kin DETAILS */}
          <div className="my-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="w-full text-lg font-medium ">NextOfKin Details</div>
            <Separator className="my-4 bg-slate-200 dark:bg-slate-800" />
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="w-full flex items-center gap-5 mb-3"
              >
                <div className="w-[98%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <FormField
                    control={form.control}
                    name={`next_of_kin.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`next_of_kin.${index}.relationship`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`next_of_kin.${index}.phone_number`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`next_of_kin.${index}.national_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500"
                  >
                    <CircleX size={18} />
                  </button>
                )}
              </div>
            ))}
            <div
              className="inline-flex items-center gap-1.5 mt-3 cursor-pointer hover:underline"
              onClick={() =>
                append({
                  name: "",
                  relationship: "",
                  phone_number: "",
                  national_id: "",
                })
              }
            >
              <CirclePlus size={18} />
              Add another Next of kin
            </div>
          </div>

          {/* KYC DOCUMENTS */}
          <div className="my-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="w-full text-lg font-medium">KYC Documents</div>
            <Separator className="my-4 bg-slate-200 dark:bg-slate-800" />

            {kycFields.map((item, index) => (
              <div
                key={item.id}
                className="w-full flex items-center gap-5 mb-4"
              >
                <div className="w-[98%] grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Document Type */}
                  <FormField
                    control={form.control}
                    name={`kyc_documents.${index}.document_type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NATIONAL_ID">
                              National ID
                            </SelectItem>
                            <SelectItem value="PASSPORT_PHOTO">
                              Passport Photo
                            </SelectItem>
                            <SelectItem value="SIGNATURE">Signature</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Upload */}
                  <FormField
                    control={form.control}
                    name={`kyc_documents.${index}.file`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload File</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0] ?? null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Verified */}
                  <FormField
                    control={form.control}
                    name={`kyc_documents.${index}.verified`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Verified</FormLabel>
                        <Select
                          value={field.value ? "true" : "false"}
                          onValueChange={(v) => field.onChange(v === "true")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="false">Not Verified</SelectItem>
                            <SelectItem value="true">Verified</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {/* {kycFields.length > 1 && ( */}
                <button
                  type="button"
                  onClick={() => removeKyc(index)}
                  className="text-red-500"
                >
                  <CircleX size={18} />
                </button>
                {/* )} */}
              </div>
            ))}

            <div
              className="inline-flex items-center gap-1.5 mt-3 cursor-pointer hover:underline"
              onClick={() =>
                appendKyc({
                  document_type: "NATIONAL_ID",
                  file: null,
                  verified: false,
                })
              }
            >
              <CirclePlus size={18} />
              Add another document
            </div>
          </div>

          <div className="w-full flex items-center justify-end gap-5">
            {!memberId && (
              <Button
                type="submit"
                variant="outline"
                className="ml-2"
                disabled={isSubmitting}
                onClick={() => {
                  submissionActionRef.current = "continue";
                  setSubmissionAction("continue");
                }}
              >
                {isSubmitting && submissionAction === "continue" ? (
                  <Spinner />
                ) : (
                  "Save & Continue"
                )}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => {
                submissionActionRef.current = "save";
                setSubmissionAction("save");
              }}
            >
              {isSubmitting && submissionAction === "save" ? (
                <Spinner />
              ) : memberId ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MembersEdit;
