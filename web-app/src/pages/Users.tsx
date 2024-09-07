import { ColumnDef } from "@tanstack/react-table";
import { useDataFetch } from "@/hooks/useDataFetch";
// components
import { DataTable } from "@/components/data-table";
import Spinner from "@/components/Spinner";
// types
import { UserProps } from "@/types";

import ProfilePlaceholder from '@/assets/profile-placeholder.png'

// table columns
const columns: ColumnDef<UserProps>[] = [
  {
    header: "Image",
    accessorKey: "profile.profile_image",
    cell: ({ row }) => {
      return (
        <img
          src={row.original.profile.profile_image ? row.original.profile.profile_image.toString() : ProfilePlaceholder}
          alt={row.original.username}
          className="w-10 h-10 rounded-full"
        />
      );
    },
  },
  {
    header: "User Name",
    accessorKey: "username",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Role",
    accessorKey: "profile.role_display",
  },
];

const Users = () => {  
  const {data, loading, error} = useDataFetch<UserProps>('users')

  // Show loading indicator when loading
  if (loading) return <div className="w-full min-h-screen flex justify-center items-center"><Spinner /></div>

  // handling error
  if(error) return <div className="w-full min-h-screen flex justify-center items-center">Error : {error.message}</div>
  return (
    <>
      <DataTable
        title="Users"
        route="/users/edit"
        btnTitle="Create User"
        data={data}
        columns={columns}
        filters= 'username'
      />
    </>
  );
};

export default Users;
