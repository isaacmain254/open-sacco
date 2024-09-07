import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {  useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiBaseUrl } from "@/constants";
// custom hooks
import { useFetchSingleObject } from "@/hooks/useFetchSingleObject";
// types
import { AccountProps } from "@/types";
// components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";

// form schema validation with zod
const formSchema = z.object({
  // customer: z.string(coerce.number()),
  customer: z.coerce.number().min(1, {
    message: "Required",
  }),
  account_type: z.string().refine((value) => value !== "", {
      message: "Required",
     }),
  // status: z.string().refine((value) => value !== "", {
  //   message: "Required",
  // }),
  status: z.string().optional(),
});

const AccountsEdit = () => {
  const { accountNo } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  // TODO: This is just a working solution, using condition on custom hook is breaking React rules
  // Fetch account data
  const { data: accountDetails } = useFetchSingleObject<AccountProps>(
    `accounts/${accountNo}`,
    accountNo ? true : false
  );
  console.log(accountDetails);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: 0,
      // account_type: "",
      // status: ''
    },
    values: accountDetails,
  });

  // handle form submit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    setLoading(true);
    try {
      if (accountNo) {
        await axios.patch(`${apiBaseUrl}/accounts/${accountNo}/`, values);
        toast.success("Account updated successfully");
      } else {
        await axios.post(`${apiBaseUrl}/accounts/`, values);
        toast.success("Account created successfully");
      }
      setLoading(false);
      navigate("/accounts");
    } catch (error) {
      setLoading(false);
      toast.error("An error occurred");
    }
  };

  if (loading)
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-medium">New Account</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-gray-200/50 my-5 p-5 rounded-md dark:bg-blue-900">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pb-5">
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer ID.</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
                        // type="number"
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
                name="account_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => v != "" && field.onChange(v)}
                      // defaultValue={field.value}
                      // {...field}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Current">Current</SelectItem>
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Joint">Joint</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {accountNo && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => v != "" && field.onChange(v)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="Dormant">Dormant</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {/* <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an account Name" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Starter">Starter</SelectItem>
                        <SelectItem value="Salary">Salary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      You can manage email addresses in your
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default AccountsEdit;
