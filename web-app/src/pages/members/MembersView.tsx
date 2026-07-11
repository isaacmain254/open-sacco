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
// import { Badge } from "@/components/ui/badge";

import Spinner from "@/components/Spinner";
// hooks
import { useGetMemberById } from "@/hooks/api/members";
import { useGetMemberAccounts } from "@/hooks/api/accounts";
import { useGetMemberTransactions } from "@/hooks/api/transactions";
import { useLoans } from "@/hooks/api/loans";
import { useUserProfileInfo } from "@/hooks/useUserProfile";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import AddAccountForm from "@/components/accounts/AddAccountForm";
import { TransactionForm } from "@/components/transactions/transactionForm";
import LucideIcon from "@/components/LucideIcon";

const loanStatusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  disbursed: "Disbursed",
};

const MembersView = () => {
  const [openAddAccountModal, setOpenAddAccountModal] = useState(false);
  const [openTransactionModal, setOpenTransactionModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const { memberId } = useParams();
  const { profile } = useUserProfileInfo();
  const canViewLoans = ["AD", "MA", "OP", "LO"].includes(profile?.role || "");

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
  const { data: memberLoans = [], isLoading: isMemberLoansLoading, error: memberLoansError } =
    useLoans({ member: memberId || "" }, canViewLoans);

  // Show loading indicator when loading
  if (isLoading || isMemberAccountsLoading || isMemberTransactionsLoading)
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
                <div key={nextOfKin.national_id} className="my-4">
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
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle>Loan Applications</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">Applications submitted for this member.</p>
                </div>
                {canViewLoans && <Link className="text-sm text-blue-700 underline" to="/loans/edit">New application</Link>}
              </CardHeader>
              <CardContent>
                {!canViewLoans ? <p className="text-sm text-slate-500">Loan applications are available to loan, operations, manager, and administrator roles.</p> : isMemberLoansLoading ? <div className="flex justify-center py-6"><Spinner /></div> : memberLoansError ? <p className="text-sm text-red-600">Unable to load this member’s loan applications.</p> : <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application</TableHead>
                      <TableHead>Loan type</TableHead>
                      <TableHead>Requested amount</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberLoans.length ? memberLoans.map((loan) => (
                      <TableRow key={loan.application_number}>
                        <TableCell>{loan.application_number}</TableCell>
                        <TableCell>{loan.loan_type_name}</TableCell>
                        <TableCell>Ksh {Number(loan.requested_amount).toLocaleString()}</TableCell>
                        <TableCell>{formatDate(loan.created_at)}</TableCell>
                        <TableCell><span className={`rounded-full px-2 py-1 text-xs ${loan.status === "rejected" ? "bg-red-100 text-red-800" : loan.status === "approved" || loan.status === "disbursed" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>{loanStatusLabels[loan.status] || loan.status}</span></TableCell>
                        <TableCell><Link className="text-blue-700 underline" to={loan.status === "draft" ? `/loans/edit/${loan.application_number}` : `/loans/view/${loan.application_number}`}>{loan.status === "draft" ? "Edit" : "View"}</Link></TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">No loan applications found for this member.</TableCell></TableRow>}
                  </TableBody>
                </Table>}
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
