import { useState, useEffect } from "react";
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
  useUpdateMember
} from "@/hooks/api/members";

// form validation - zod schemas
const nextOfKinSchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  phone_number: z.string().optional(),
  national_id: z.string().optional(),
});

const employmentSchema = z.object({
  employment_type: z.string().min(1, "Employment type is required"),
  employer_name: z.string().nullable().optional(),
  job_title: z.string().nullable().optional(),
  monthly_income: z
    .union([z.number(), z.string()])
    .transform((v) => (v === "" ? null : Number(v)))
    .nullable()
    .optional(),
  business_name: z.string().nullable().optional(),
  business_type: z.string().nullable().optional(),
});

const kycDocumentSchema = z.object({
  document_type: z.string().min(1, "Document type is required"),
  file: z
    .any()
    .refine((file) => file instanceof File || file === null, {
      message: "File is required",
    })
    .nullable(),
  verified: z.boolean().default(false),
});

const formSchema = z.object({
  salutation: z.string().min(1, "This field is required"),

  first_name: z.string().min(1, "This field is required"),
  middle_name: z.string().min(1, "This field is required"),
  last_name: z.string().min(1, "This field is required"),

  national_id: z
    .string()
    .min(8, "National ID is required")
    .max(10, "National ID must be at most 10 digits"),

  phone_number: z.string().min(1, "This field is required"),

  email: z
    .string()
    .min(1, "This field is required")
    .email("Enter a valid email address"),

  date_of_birth: z.string().min(1, "This field is required"),

  kra_pin: z.string().min(1, "This field is required"),

  country: z.string().min(1, "This field is required"),
  county: z.string().min(1, "This field is required"),
  city: z.string().min(1, "This field is required"),

  status: z.string().min(1, "This field is required"),
  employment: employmentSchema,

  next_of_kin: z.array(nextOfKinSchema).optional(),
  kyc_documents: z.array(kycDocumentSchema).optional(),
});

const MembersEdit = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [continueAdding, setContinueAdding] = useState(false);
  // let continueAdding = false;

  // Get member details
  const { data: member, isLoading } = useGetMemberById(memberId!);
  // Create member mutation
  const { mutate: createMember, isPending: isCreatingMember } =useCreateMember()
  // Update member mutation
  const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salutation: "",
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
      status: "",

      employment: {
        employment_type: "",
        employer_name: "",
        job_title: "",
        monthly_income: null,
        business_name: "",
        business_type: "",
      },

      next_of_kin: [],
      kyc_documents: [
        {
          document_type: "",
          file: null,
          verified: false,
        },
      ],
    },
  });

  // Populate form with existing customer data for edit
  useEffect(() => {
    if (member) {
      form.reset({
        ...member,
        next_of_kin: member.next_of_kin ?? [],
        kyc_documents: member.kyc_documents ?? [],
        // employment: customer.employment ?? form.getValues("employment"),
      });
    }
  }, [member]);

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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = {
      ...values,
      next_of_kin: values.next_of_kin ?? [],
      kyc_documents: values.kyc_documents ?? [],
    };

    if (memberId) {
      updateMember(
        { memberId, data: payload },
        {
          onSuccess: () => {
            toast.success("Member updated successfully");
            navigate("/members");
          },
          onError: () => toast.error("Failed to update Member"),
        },
      );
    } else {
      createMember(payload, {
        onSuccess: () => {
          toast.success("Member created successfully");
          if (continueAdding) {
            form.reset();
            navigate("/members/edit");
          } else {
            navigate("/members");
          }
        },
        onError: () => toast.error("Failed to create members"),
      });
    }
  };
  console.log("continue editting", continueAdding);

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
          <div className="bg-gray-200/50 my-5 p-5 rounded-md dark:bg-blue-900">
            <div className="w-full text-lg font-medium ">Personal Details</div>
            <Separator className="my-4 bg-slate-400" />
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
                        placeholder="YYYY-MM-DD"
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
          <div className="bg-gray-200/50 my-5 p-5 rounded-md dark:bg-blue-900">
            <div className="w-full text-lg font-medium ">Address</div>
            <Separator className="my-4 bg-slate-400" />
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
          <div className="bg-gray-200/50 my-5 p-5 rounded-md dark:bg-blue-900">
            <div className="w-full text-lg font-medium ">
              Employment Details
            </div>
            <Separator className="my-4 bg-slate-400" />
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

              <FormField
                control={form.control}
                name="employment.employer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Open Sacco"
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
                name="employment.job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Accountant"
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
                name="employment.monthly_income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="KES 100,000"
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
                name="employment.business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kinuthia Enterprises"
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
                name="employment.business_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Retail"
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
          {/* Next Of Kin DETAILS */}
          <div className="bg-gray-200/50 my-5 p-5 rounded-md dark:bg-blue-900">
            <div className="w-full text-lg font-medium ">NextOfKin Details</div>
            <Separator className="my-4 bg-slate-400" />
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
          <div className="bg-gray-200/50 my-5 p-5 rounded-md dark:bg-blue-900">
            <div className="w-full text-lg font-medium">KYC Documents</div>
            <Separator className="my-4 bg-slate-400" />

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
                  document_type: "",
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
                variant="outline"
                className="ml-2"
                onClick={() => setContinueAdding(true)}
              >
                {isCreatingMember ? <Spinner /> : "Save & Continue"}
              </Button>
            )}
            <Button type="submit">
              {isCreatingMember || isUpdatingMember ? (
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
