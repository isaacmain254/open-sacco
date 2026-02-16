import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";

// components
import { DataTable } from "@/components/data-table";
import LucideIcon from "@/components/LucideIcon";
import Spinner from "@/components/Spinner";
import { useGetAccounts } from "@/hooks/api/accounts";
import { AccountProps } from "@/services/accounts";
import AddAccountForm from "@/components/accounts/AddAccountForm";
import Modal from "@/components/ui/Modal";
import CopyToClipboard from "@/components/ui/clipboard";

const Accounts = () => {
  const [openAddAccountModal, setOpenAddAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const { data: accounts, isLoading, error } = useGetAccounts();
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

  const columns: ColumnDef<AccountProps>[] = [
    {
      accessorKey: "account_number",
      header: "Account Number",
      cell: ({ row }) => {
        return (
          <CopyToClipboard text={row.original.account_number} to={`/accounts/view/${row.original.account_number}`} />
        );
      },
    },
    {
      accessorKey: "member",
      header: "Member ID",
    },
    {
      accessorKey: "product",
      header: "Product ID",
    },
    {
      accessorKey: "balance",
      header: "Balance",
    },
    {
      accessorKey: "is_active",
      header: "Active",
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div>
            <LucideIcon
              name="SquarePen"
              size={18}
              className="cursor-pointer"
              onClick={() => {
                setOpenAddAccountModal(true);
                setSelectedAccount(row.original.account_number);
              }}
            />
          </div>
        );
      },
    },
  ];
  return (
    <>
      <DataTable
        title="Accounts"
        btnTitle="Create Account"
        onClick={() => {
          setOpenAddAccountModal(true);
        }}
        data={accounts || []}
        columns={columns}
        filters="account_number"
      />
      <Modal
        isOpen={openAddAccountModal}
        onClose={() => {
          setOpenAddAccountModal(false);
          setSelectedAccount("");
        }}
        title="Add Account"
      >
        <AddAccountForm accountNo={selectedAccount} />
      </Modal>
    </>
  );
};

export default Accounts;
