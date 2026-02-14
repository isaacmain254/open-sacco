import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {  useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiBaseUrl } from "@/constants";
// custom hooks
import { useFetchSingleObject } from "@/hooks/useFetchSingleObject";
// types
// import { AccountProps } from "@/types";
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
import { useCreateAccount, useGetAccountById, useGetProducts } from "@/hooks/api/accounts";

// form schema validation with zod
const formSchema = z.object({
  // customer: z.string(coerce.number()),
  member: z.string().min(1, "This field is required"),
  product: z.string().min(1, "This field is required"),
 is_active: z.boolean().default(true)
});

const AccountsEdit = () => {
  const { accountNo } = useParams();
  // const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  // TODO: This is just a working solution, using condition on custom hook is breaking React rules
  // Fetch account data
  // const { data: accountDetails } = useFetchSingleObject<AccountProps>(
  //   `accounts/${accountNo}`,
  //   accountNo ? true : false
  // );
  // console.log(accountDetails);
// Fetch all products
  const { data: products, isLoading: productsLoading } = useGetProducts()
  // Get account by ID
  const { data: account, isLoading: accountLoading } = useGetAccountById(accountNo!)
  // Create account
  const { mutate: createAccount, isPending: isCreatingAccount } = useCreateAccount()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member: "",
      product: "",
      is_active: false
    },
  });


  // Populate form with existing customer data for edit
  useEffect(() => {
    if(account){
      form.reset({
        member: account.member,
        product: account.product,
        is_active: account.is_active
      })
}
  },[account])

  // handle form submit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
  
    const payload = {
      member: values.member,
      product: values.product,
      is_active: values.is_active
    }
    createAccount(payload, {
      onSuccess: () => {
        toast.success("Account created successfully");
        navigate("/accounts");
      },
      onError: () => {
        toast.error("An error occurred");
      }
    })
  };

  if (productsLoading || accountLoading )
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
                name="member"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="M000013"
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
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
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
                        {products?.map((product, index) => (
                          <SelectItem key={index} value={product.name}>
                            {product.name.charAt(0).toUpperCase() + product.name.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {accountNo && (
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Status</FormLabel>
                      <Select
                        value={field.value ? "true" : "false"}
                        onValueChange={(v) => field.onChange(v === "true")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an account status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
      
            
            </div>
          </div>
          <Button type="submit">
            {isCreatingAccount ? "Submitting..." : "Create Account"}</Button>
        </form>
      </Form>
    </div>
  );
};

export default AccountsEdit;
