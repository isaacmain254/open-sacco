// import Button from "@/components/Button";
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
// components
import { DataTable } from "@/components/data-table";
import Spinner from "@/components/Spinner";
import LucideIcon from "@/components/LucideIcon";
// Services - API calls
import { MemberProps } from "@/services/members";
import { useGetMembers } from "@/hooks/api/members";

const columns: ColumnDef<MemberProps>[] = [
  {
    accessorKey: "membership_number",
    header: "Member Number",
    cell: ({ row }) => {
      return (
        <div className="underline">
          <Link to={`/members/view/${row.original.id}`}>
            {row.original.membership_number}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "first_name",
    header: "First Name",
  },
  {
    accessorKey: "last_name",
    header: "Last_ Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  { accessorKey: "phone_number", header: "Phone Number" },
  {
    accessorKey: "national_id",
    header: "ID Number",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div
          className={`font-light rounded-full px-1 py-0.5 text-center ${row.original.status === "Active" ? "bg-green-600 text-white" : row.original.status === "Suspended" ? "bg-red-600 text-white" : "bg-blue-900 text-white"}`}
        >
          {row.original.status}
        </div>
      );
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Link to={`/members/edit/${row.original.id}`}>
          <LucideIcon name="SquarePen" size={17} />
        </Link>
      );
    },
  },
];

const Members = () => {
  const { data: members, error, isLoading } = useGetMembers();
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
    <>
      <DataTable
        title="Members"
        route="/members/edit"
        btnTitle="Create Member"
        data={members ?? []}
        columns={columns}
        filters="national_id"
      />
    </>
  );
};

export default Members;
