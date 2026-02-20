import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {  useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
import {
  useCreateAccount,
  useGetAccountById,
  useGetProducts,
  useUpdateAccount,
} from "@/hooks/api/accounts";

// form schema validation with zod
const formSchema = z.object({
  // customer: z.string(coerce.number()),
  member: z.string().min(1, "This field is required"),
  product: z.string().min(1, "This field is required"),
  is_active: z.boolean().default(true),
});

export interface AddAccountFormProps {
  memberNo?: string;
  accountNo?: string;
}

export default function AddAccountForm({
  memberNo,
  accountNo,
}: AddAccountFormProps) {
  const navigate = useNavigate();

  // Fetch all products
  const { data: products, isLoading: productsLoading } = useGetProducts();
  // Get account by ID
  const { data: account   } = useGetAccountById(
    accountNo!,
  );
  // update account
  const { mutate: updateAccount, isPending: isUpdatingAccount } =
    useUpdateAccount();
  // Create account
  const { mutate: createAccount, isPending: isCreatingAccount } =
    useCreateAccount();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member: "",
      product: "",
      is_active: false,
    },
  });

  // Populate form with existing customer data for edit
  useEffect(() => {
    if (accountNo && account) {
      form.reset({
        member: account.member,
        product: account.product,
        is_active: account.is_active,
      });
    } else if (!accountNo) {
      form.reset({
        member: memberNo || "",
        product: "",
        is_active: true,
      });
    }
  }, [accountNo, account, memberNo, form]);

  // handle form submit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload = {
      member: values.member,
      product: values.product,
      is_active: values.is_active,
    };
    if (accountNo) {
      updateAccount(
        { accountNo, data: payload },
        {
          onSuccess: () => {
            toast.success("Account updated successfully");
            navigate(`/accounts`);
          },
          onError: (error) => {
            console.log(error);
            toast.error(error.message);
          },
        },
      );
    } else {
      createAccount(payload, {
        onSuccess: () => {
          toast.success("Account created successfully");
          if (memberNo) {
            navigate(`/members/view/${memberNo}`);
          } else {
            navigate(`/accounts`);
          }
        },
        onError: () => {
          toast.error("An error occurred");
        },
      });
    }
  };

  if (productsLoading)
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-gray-200/50 my-5 p-5 rounded-md dark:bg-blue-900">
          <div className="space-y-5">
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
                      disabled={!!memberNo || !!accountNo}
                      className="!focus-visible:ring-0 !focus-visible:ring-offset-0 text-gray-900 dark:text-gray-100"
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
                          {product.name.charAt(0).toUpperCase() +
                            product.name.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {
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
            }
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">
            {isCreatingAccount || isUpdatingAccount
              ? "Submitting..."
              : accountNo
                ? "Update Account"
                : "Create Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
