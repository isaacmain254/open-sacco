import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { usePostTransaction } from "@/hooks/api/transactions";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  transaction_type: z.string().min(1, "Transaction type is required"),
  amount: z.number().min(1, "Amount is required"),
  account_number: z.string().min(1, "Account number is required"),
  narration: z.string().optional(),
});

export interface TransactionFormProps {
  accountNo?: string;
}

export const TransactionForm = ({ accountNo }: TransactionFormProps) => {
  const { mutate, isPending } = usePostTransaction();

  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transaction_type: "",
      amount: 0,
      account_number: accountNo || "",
      narration: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    const payload = {
      ...values,
      amount: Number(values.amount),
    };
    mutate(payload, {
      onSuccess: () => {
        form.reset();
        toast.success("Transaction completed successfully");
        navigate(`/transactions`);
      },
      onError: () => {
        toast.error("Transaction failed");
      },
    });
  };
  return (
    <div>
      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter account number"
                    {...field}
                    disabled={!!accountNo}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="transaction_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter amount"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="narration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Narration</FormLabel>
                <FormControl>
                  <Input placeholder="Enter narration" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ModalFooter */}
          <div className="flex justify-end gap-x-2 mt-5">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
