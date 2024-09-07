import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

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
import { CustomerProps } from "@/types";
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
  id_number: z.string().max(10).min(2, { message: "ID number is required" }),
  phone_number: z.string({ required_error: "Phone number is required" }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  date_of_birth: z.date({
    required_error: "A date of birth is required.",
  }),
  tax_number: z.string({ required_error: "Tax number is required" }),
  country: z.string({ required_error: "Country is required" }),
  county: z.string({ required_error: "County is required" }),
  city: z.string({ required_error: "City is required" }),
  po_box: z.coerce.number().min(2, { message: "P.O Box required" }),
});

const CustomersEdit = () => {
  const { customerId } = useParams();
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const { data: customer } = useFetchSingleObject<CustomerProps>(
    `customers/${customerId}`, customerId ? true : false
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salutation: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      id_number: "",
      phone_number: "",
      email: "",
      tax_number: "",
      country: "",
      county: "",
      city: "",
      po_box: 0
    },
    values: customer
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    setLoading(true);
    try {
      // Format the date_of_birth to YYYY-MM-DD
      const formattedValues = {
        ...values,
        date_of_birth: format(values.date_of_birth, "yyyy-MM-dd"),
      };
      if (customerId) {
        await axios.patch(`${apiBaseUrl}/customers/${customerId}/`, formattedValues);
        toast.success("Customer information updated successfully");
      } else {
        await axios.post(`${apiBaseUrl}/customers/`, formattedValues);
        toast.success("Customer created successfully");
      }
      setLoading(false);
      navigate("/customers")
    } catch (error) {
      setLoading(false);
      toast.error("Hmmm! Something went wrong. Please check and try again");
      console.log(error);
    }
  }

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* customers details */}
          <div className="bg-gray-200/50 my-5 p-5 rounded-md dark:bg-blue-900">
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
              <FormField
                control={form.control}
                name="id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID No.</FormLabel>
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
                      onValueChange={v => v!= "" && field.onChange(v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select salutation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Miss">Miss</SelectItem>
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
                              !field.value && "text-muted-foreground"
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
                name="tax_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax No.</FormLabel>
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
            <div className="w-full text-lg font-medium ">Addresses</div>
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
              {/* <FormField
                control={form.control}
                name="ward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        {...field}
                        className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormDescription>Identification number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
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
              <FormField
                control={form.control}
                name="po_box"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>P.O. Box</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        type="number"
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
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default CustomersEdit;
