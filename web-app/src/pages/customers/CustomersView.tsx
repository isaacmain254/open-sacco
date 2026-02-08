import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// import { useFetchSingleObject } from "@/hooks/useFetchSingleObject";
// types
// import {
//   AccountProps,
//   CustomerProps,
//   LoanProps,
//   TransactionProps,
// } from "@/types";
// import { useDataFetch } from "@/hooks/useDataFetch";
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
import { customersService } from "@/services/customers";
import Spinner from "@/components/Spinner";

const CustomersView = () => {
  const { customerId } = useParams();
  // const { data: customer } = useFetchSingleObject<CustomerProps>(
  //   `customers/${customerId}`
  // );
  // const { data: customerAccounts } = useDataFetch<AccountProps>(
  //   `accounts/?customer_id=${customerId}`
  // );
  // const { data: customerTransactions } = useDataFetch<TransactionProps>(
  //   `transactions/?customer_id=${customerId}`
  // );
  // const { data: customerLoans } = useDataFetch<LoanProps>(
  //   `loans/?customer_id=${customerId}`
  // );

  const {
    data: customer,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => customersService.getCustomerById(customerId!),
    enabled: !!customerId,
  });

  console.log("Customer data:", customer);
  // Show loading indicator when loading
  if (isLoading)
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );

  // handling error
  if (error)
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        Error : {error.message}
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-medium">Member Details</h1>
      <div className="my-5 space-y-10 lg:space-y-0 lg:grid lg:grid-cols-12 gap-8">
        <div className="col-span-3  space-y-8">
          <div className="bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <h3 className="text-center font-semibold text-lg pb-2">
              Personal Details
            </h3>
            <div className="font-medium">
              Membership No:{" "}
              <span className="font-light">{customer?.membership_number}</span>
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
              Middle Name:{" "}
              <span className="font-light">{customer?.middle_name}</span>
            </div>
            <div className="font-medium">
              Last Name:{" "}
              <span className="font-light">{customer?.last_name}</span>
            </div>
            <div className="font-medium">
              National ID:{" "}
              <span className="font-light">{customer?.national_id}</span>
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
              KRA PIN: <span className="font-light">{customer?.kra_pin}</span>
            </div>
            <div className="font-medium">
              Country: <span className="font-light">{customer?.country}</span>
            </div>
            <div className="font-medium">
              County: <span className="font-light">{customer?.county}</span>
            </div>

            <div className="font-medium">
              City: <span className="font-light">{customer?.city}</span>
            </div>

            <div className="font-medium">
              Status:{" "}
              <span
                className={`font-light rounded-full px-2 text-center ${customer?.status === "Active" ? "bg-green-600 text-white" : customer?.status === "Suspended" ? "bg-red-600 text-white" : "bg-blue-900 text-white"}`}
              >
                {customer?.status}
              </span>
            </div>
          </div>
          {/* EMPLOYMENT DETAILS */}
          <div className="bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <h3 className="text-center font-semibold text-lg pb-2">
              Employment Details
            </h3>
            <div className="font-medium">
              Employment Type :{" "}
              <span className="font-light">
                {customer?.employment?.employment_type}
              </span>
            </div>
            <div className="font-medium">
              EMployment :{" "}
              <span className="font-light">
                {customer?.employment?.employer_name}
              </span>
            </div>
            <div className="font-medium">
              JOb Title :{" "}
              <span className="font-light">
                {customer?.employment?.job_title}
              </span>
            </div>
            <div className="font-medium">
              Monthly Income:{" "}
              <span className="font-light">
                {customer?.employment?.job_title}
              </span>
            </div>
            <div className="font-medium">
              Business Type:{" "}
              <span className="font-light">
                {customer?.employment?.business_type}
              </span>
            </div>
            <div className="font-medium">
              Business Name:{" "}
              <span className="font-light">
                {customer?.employment?.business_name}
              </span>
            </div>
          </div>
          <div className="bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <h3 className="text-center font-semibold text-lg pb-2">
              Next Of Kin Details
            </h3>
            {customer?.next_of_kin.length > 0 &&
              customer?.next_of_kin.map((nextOfKin) => (
                <div key={nextOfKin.id} className="my-4">
                  <div className="font-medium">
                    Name :<span className="font-light">{nextOfKin.name}</span>
                  </div>
                  <div className="font-medium">
                    Relationship :
                    <span className="font-light">{nextOfKin.relationship}</span>
                  </div>
                  <div className="font-medium">
                    Phone Number :
                    <span className="font-light">{nextOfKin.phone_number}</span>
                  </div>
                  <div className="font-medium">
                    National ID :<span className="font-light">{nextOfKin.national_id}</span>
                  </div>
                </div>
              ))}
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
                    {/* {customerAccounts.slice(0, 10).map((account) => (
                      <TableRow key={account.account_number}>
                        <TableCell>{account.account_number}</TableCell>
                        <TableCell>{account.account_type}</TableCell>
                        <TableCell>${account.balance}</TableCell>
                        <TableCell>
                          <Badge variant="outline"> {account.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))} */}
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
                    {/* {customerTransactions.slice(0, 10).map((transaction) => (
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
                    ))} */}
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
                    {/* {customerLoans.length > 0 ? (
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
                    )} */}
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
