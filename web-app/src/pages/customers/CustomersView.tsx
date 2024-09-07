import { useParams } from "react-router-dom";
import { useFetchSingleObject } from "@/hooks/useFetchSingleObject";
// types
import {
  AccountProps,
  CustomerProps,
  LoanProps,
  TransactionProps,
} from "@/types";
import { useDataFetch } from "@/hooks/useDataFetch";
// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const CustomersView = () => {
  const { customerId } = useParams();
  const { data: customer } = useFetchSingleObject<CustomerProps>(
    `customers/${customerId}`
  );
  const { data: customerAccounts } = useDataFetch<AccountProps>(
    `accounts/?customer_id=${customerId}`
  );
  const { data: customerTransactions } = useDataFetch<TransactionProps>(
    `transactions/?customer_id=${customerId}`
  );
  const { data: customerLoans } = useDataFetch<LoanProps>(
    `loans/?customer_id=${customerId}`
  );

  return (
    <div>
      <h1 className="text-2xl font-medium">Member Details</h1>
      <div className="my-5 space-y-10 lg:space-y-0 lg:grid lg:grid-cols-12 gap-8">
        <div className="col-span-3  space-y-8">
          <div className="bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <div className="font-medium">
              AccountNo: <span className="font-light">1234456</span>
            </div>
            <div className="font-medium">
              ID No: <span className="font-light">{customer?.id_number}</span>
            </div>
            <div className="font-medium">
              Salutation:{" "}
              <span className="font-light">{customer?.salutation}</span>
            </div>
            <div className="font-medium">
              First Name:{" "}
              <span className="font-light">{customer?.first_name}</span>
            </div>
            <div className="font-medium">
              First Name:{" "}
              <span className="font-light">{customer?.middle_name}</span>
            </div>
            <div className="font-medium">
              Last Name:{" "}
              <span className="font-light">{customer?.last_name}</span>
            </div>
            <div className="font-medium">
              Phone Number:{" "}
              <span className="font-light">{customer?.phone_number}</span>
            </div>
            <div className="font-medium">
              Email: <span className="font-light">{customer?.email}</span>
            </div>
            <div className="font-medium">
              Date of Birth:{" "}
              <span className="font-light">
                {customer?.date_of_birth.toString()}
              </span>
            </div>
            <div className="font-medium">
              Tax No: <span className="font-light">{customer?.tax_number}</span>
            </div>
          </div>
          <div className="bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <div className="font-medium">
              Country: <span className="font-light">{customer?.country}</span>
            </div>
            <div className="font-medium">
              County: <span className="font-light">Muranga</span>
            </div>
            <div className="font-medium">
              Ward: <span className="font-light">Kamacharia</span>
            </div>
            <div className="font-medium">
              City: <span className="font-light">{customer?.city}</span>
            </div>
            <div className="font-medium">
              P.O. Box: <span className="font-light">{customer?.po_box}</span>
            </div>
          </div>
        </div>
        <div className="col-span-9 space-y-8">
          <div className=" bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
              <CardHeader className="flex flex-row items-center">
                <CardTitle>Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerAccounts.slice(0, 10).map((account) => (
                      <TableRow key={account.account_number}>
                        <TableCell>{account.account_number}</TableCell>
                        <TableCell>{account.account_type}</TableCell>
                        <TableCell>${account.balance}</TableCell>
                        <TableCell>
                          <Badge variant="outline"> {account.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className=" bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
              <CardHeader className="flex flex-row items-center">
                <CardTitle>Transactions History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerTransactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.transaction_id}>
                        <TableCell>{transaction.account}</TableCell>
                        <TableCell>{transaction.transaction_type}</TableCell>
                        <TableCell className="">
                          ${transaction.amount}
                        </TableCell>
                        <TableCell>
                          {transaction.transaction_date.toString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className=" bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
              <CardHeader className="flex flex-row items-center">
                <CardTitle>Loan History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerLoans.length > 0 ? (
                    customerLoans.slice(0, 10).map((loan) => (
                      <TableRow key={loan.loan_id}>
                        <TableCell>{loan.account}</TableCell>
                        <TableCell>{loan.loan_type}</TableCell>
                        <TableCell>
                          ${loan.amount}
                        </TableCell>
                        <TableCell>
                          ${loan.loan_balance}
                        </TableCell>
                        <TableCell>
                          {loan.loan_status}
                        </TableCell>
                      </TableRow>
                    ))
                    ) : (
                      <div className="text-center">
                        <h1 className="text-2xl font-medium">No loans history</h1>
                      </div>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersView;
