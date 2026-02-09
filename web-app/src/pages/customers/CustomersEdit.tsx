import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { CirclePlus } from "lucide-react";

import { useFetchSingleObject } from "@/hooks/useFetchSingleObject";
import { cn } from "@/lib/utils";
import { apiBaseUrl } from "@/constants";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import Spinner from "@/components/Spinner";
// types
// import { CustomerProps } from "@/types";
import { toast } from "react-toastify";

// form validation
const formSchema = z.object({
  salutation: z.string().refine((value) => value !== "", {
    message: "Please select an option.",
  }),
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  middle_name: z.string().min(2, {
    message: "Middle name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  national_id: z.string().max(10).min(2, { message: "ID number is required" }),
  phone_number: z.string({ required_error: "Phone number is required" }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  date_of_birth: z.date({
    required_error: "A date of birth is required.",
  }),
  kra_pin: z.string({ required_error: "Tax number is required" }),
  country: z.string({ required_error: "Country is required" }),
  county: z.string({ required_error: "County is required" }),
  city: z.string({ required_error: "City is required" }),
  po_box: z.coerce.number().min(2, { message: "P.O Box required" }),
  // employer_name:
});

const CustomersEdit = () => {
  // const { customerId } = useParams();
  // const customerId = ""
  // const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // const { data: customer } = useFetchSingleObject(
  //   `customers/${customerId}`,
  //   customerId ? true : false,
  // );
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
      kra_pin: "",
      country: "",
      county: "",
      city: "",
      po_box: 0,
      // employer_name: "",
      next_of_kin: [
        {
          name: "",
          relationship: "",
          phone_number: "",
          national_id: "",
        },
      ],
    },
    // values: customer,
  });

  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "next_of_kin",
  });

  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   console.log(values);
  //   setLoading(true);
  //   try {
  //     // Format the date_of_birth to YYYY-MM-DD
  //     const formattedValues = {
  //       ...values,
  //       date_of_birth: format(values.date_of_birth, "yyyy-MM-dd"),
  //     };
  //     if (customerId) {
  //       await axios.patch(
  //         `${apiBaseUrl}/customers/${customerId}/`,
  //         formattedValues,
  //       );
  //       toast.success("Customer information updated successfully");
  //     } else {
  //       await axios.post(`${apiBaseUrl}/customers/`, formattedValues);
  //       toast.success("Customer created successfully");
  //     }
  //     setLoading(false);
  //     navigate("/customers");
  //   } catch (error) {
  //     setLoading(false);
  //     toast.error("Hmmm! Something went wrong. Please check and try again");
  //     console.log(error);
  //   }
  // }

  if (loading)
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-medium">New Customer</h1>
      <Form {...form}>
        {/* onSubmit={form.handleSubmit(onSubmit)}  */}
        <form className="space-y-8">
          {/* customers details */}
          <div className="bg-gray-200/50 my-5 p-5 rounded-md dark:bg-blue-900">
            <div className="w-full text-lg font-medium ">Personal Details</div>
            <Separator className="my-4 bg-slate-400" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pb-5">
              {/* <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Id</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormDescription>customer Id</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>
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
                        placeholder="345893"
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
                        placeholder=""
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
                        placeholder="345893"
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
                        placeholder=""
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
                        placeholder=""
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
              />
              <FormField
                control={form.control}
                name="kra_pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KRA PIN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
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
          {/* Address */}
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
                        placeholder=""
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
                        placeholder=""
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
                        placeholder=""
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
              <FormItem>
                <FormLabel>Salutation</FormLabel>
                <Select
                  value=""
                  // onValueChange={(v) => v != "" && field.onChange(v)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select salutation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EMPLOYED">Employed</SelectItem>
                    <SelectItem value="SELF_EMPLOYED">Self Employed</SelectItem>
                    <SelectItem value="BUSINESS">Business Owner</SelectItem>
                    <SelectItem value="UNEMPLOYED">Unemployed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
              <FormField
                control={form.control}
                name="employer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
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
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
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
                name="monthly_income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
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
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
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
                name="business_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
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
                    X
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

          <div className="w-full flex items-center justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CustomersEdit;
