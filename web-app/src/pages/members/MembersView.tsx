import { Link, useParams } from "react-router-dom";
import { useState } from "react";
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

import Spinner from "@/components/Spinner";
// hooks
import { useGetMemberById } from "@/hooks/api/members";
import { useGetMemberAccounts } from "@/hooks/api/accounts";
import { useGetMemberTransactions } from "@/hooks/api/transactions";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import AddAccountForm from "@/components/accounts/AddAccountForm";
import { TransactionForm } from "@/components/transactions/transactionForm";
import LucideIcon from "@/components/LucideIcon";

const MembersView = () => {
  const [openAddAccountModal, setOpenAddAccountModal] = useState(false);
  const [openTransactionModal, setOpenTransactionModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const { memberId } = useParams();

  // Get member details
  const { data: member, isLoading, error } = useGetMemberById(memberId!);
  const nextOfKin = member?.next_of_kin ?? [];

  // Get member accounts
  const { data: memberAccounts, isLoading: isMemberAccountsLoading } =
    useGetMemberAccounts(memberId!);
  console.log("members account", memberAccounts);

  // Get member transactions
  const { data: memberTransactions, isLoading: isMemberTransactionsLoading } =
    useGetMemberTransactions(memberId!);

  // Show loading indicator when loading
  if (isLoading || isMemberAccountsLoading)
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
        {/* LEFT SIDE */}
        <div className="col-span-3  space-y-8">
          <div className="bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <h3 className="text-center font-semibold text-lg pb-2">
              Personal Details
            </h3>
            <div className="font-medium">
              Membership No:{" "}
              <span className="font-light">{member?.membership_number}</span>
            </div>
            <div className="font-medium">
              Salutation:{" "}
              <span className="font-light">{member?.salutation}</span>
            </div>
            <div className="font-medium">
              First Name:{" "}
              <span className="font-light">{member?.first_name}</span>
            </div>
            <div className="font-medium">
              Middle Name:{" "}
              <span className="font-light">{member?.middle_name}</span>
            </div>
            <div className="font-medium">
              Last Name: <span className="font-light">{member?.last_name}</span>
            </div>
            <div className="font-medium">
              National ID:{" "}
              <span className="font-light">{member?.national_id}</span>
            </div>
            <div className="font-medium">
              Phone Number:{" "}
              <span className="font-light">{member?.phone_number}</span>
            </div>
            <div className="font-medium">
              Email: <span className="font-light">{member?.email}</span>
            </div>
            <div className="font-medium">
              Date of Birth:{" "}
              <span className="font-light">
                {member?.date_of_birth.toString()}
              </span>
            </div>
            <div className="font-medium">
              KRA PIN: <span className="font-light">{member?.kra_pin}</span>
            </div>
            <div className="font-medium">
              Country: <span className="font-light">{member?.country}</span>
            </div>
            <div className="font-medium">
              County: <span className="font-light">{member?.county}</span>
            </div>

            <div className="font-medium">
              City: <span className="font-light">{member?.city}</span>
            </div>

            <div className="font-medium">
              Status:{" "}
              <span
                className={`font-light rounded-full px-2 text-center ${member?.status === "Active" ? "bg-green-600 text-white" : member?.status === "Suspended" ? "bg-red-600 text-white" : "bg-blue-900 text-white"}`}
              >
                {member?.status}
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
                {member?.employment?.employment_type}
              </span>
            </div>
            <div className="font-medium">
              EMployment :{" "}
              <span className="font-light">
                {member?.employment?.employer_name}
              </span>
            </div>
            <div className="font-medium">
              JOb Title :{" "}
              <span className="font-light">
                {member?.employment?.job_title}
              </span>
            </div>
            <div className="font-medium">
              Monthly Income:{" "}
              <span className="font-light">
                {member?.employment?.job_title}
              </span>
            </div>
            <div className="font-medium">
              Business Type:{" "}
              <span className="font-light">
                {member?.employment?.business_type}
              </span>
            </div>
            <div className="font-medium">
              Business Name:{" "}
              <span className="font-light">
                {member?.employment?.business_name}
              </span>
            </div>
          </div>
          <div className="bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <h3 className="text-center font-semibold text-lg pb-2">
              Next Of Kin Details
            </h3>
            {nextOfKin &&
              member?.next_of_kin?.map((nextOfKin) => (
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
                    National ID :
                    <span className="font-light">{nextOfKin.national_id}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
        {/* RIGHT SIDE */}
        <div className="col-span-9 space-y-8">
          {/* Accounts */}
          <div className=" bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Accounts</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedAccount("");
                    setOpenAddAccountModal(true);
                  }}
                >
                  Add Account
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberAccounts?.length ? (
                      memberAccounts?.slice(0, 10).map((account) => (
                        <TableRow key={account.account_number}>
                          <TableCell>
                            <Link
                              to={`/accounts/view/${account.account_number}`}
                              className="underline"
                            >
                              {account.account_number}
                            </Link>
                          </TableCell>
                          <TableCell>{account.product}</TableCell>
                          <TableCell>Ksh {account.balance}</TableCell>
                          <TableCell>{account.is_active}</TableCell>
                          <TableCell className="flex gap-6">
                            <LucideIcon
                              name="SquarePen"
                              className="w-3 h-3 cursor-pointer"
                              color="#3b3a3aff"
                              onClick={() => {
                                setOpenAddAccountModal(true);
                                setSelectedAccount(account.account_number);
                              }}
                            />
                            <LucideIcon
                              name="ArrowRightLeft"
                              className="w-3 h-3 cursor-pointer"
                              color="#3b3a3aff"
                              onClick={() => {
                                setOpenTransactionModal(true);
                                setSelectedAccount(account.account_number);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="w-full text-center">
                        No account found for this member
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          {/* Transactions */}
          <div className=" bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
              <CardHeader className="flex flex-row items-center">
                <CardTitle>Transactions History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Transaction Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberTransactions?.length ? (
                      memberTransactions?.slice(0, 10).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.reference}</TableCell>
                          <TableCell>{transaction.account_number}</TableCell>
                          <TableCell>{transaction.transaction_type}</TableCell>
                          <TableCell className="">
                            Ksh {transaction.amount}
                          </TableCell>
                          <TableCell>
                            {formatDate(transaction.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="w-full text-center">
                        No transactions found for this member
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          {/* Loan History */}
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
      {/* Add Account Modal */}
      <Modal
        isOpen={openAddAccountModal}
        onClose={() => setOpenAddAccountModal(false)}
        title="Add Account"
      >
        <AddAccountForm
          memberNo={member?.membership_number}
          accountNo={selectedAccount}
        />
      </Modal>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={openTransactionModal}
        onClose={() => setOpenTransactionModal(false)}
        title="Create Transaction"
      >
        <TransactionForm accountNo={selectedAccount} />
      </Modal>
    </div>
  );
};

export default MembersView;
