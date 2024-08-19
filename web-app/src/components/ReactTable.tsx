import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// type Props = {}
const users = [
    {
      "firstName": "Tanner",
      "lastName": "Linsley",
      "age": 33,
      "visits": 100,
      "progress": 50,
      "status": "Married"
    },
    {
      "firstName": "Kevin",
      "lastName": "Vandy",
      "age": 27,
      "visits": 200,
      "progress": 100,
      "status": "Single"
    }
  ]

  //TData
type User = {
    firstName: string
    lastName: string
    age: number
    visits: number
    progress: number
    status: string
  }
  
  const columns = [
    {
      header: 'First Name',
      accessorKey: 'firstName',
    },
    {
      header: 'Last Name',
      accessorKey: 'lastName',
    },
    {
      header: 'Age',
      accessorKey: 'age',
    },
    {
      header: 'Visits',
      accessorKey: 'visits',
    },
    {
      header: 'Progress',
      accessorKey: 'progress',
    },
    {
      header: 'Status',
      accessorKey: 'status',
    },
  ]

const ReactTable = () => {
    const data: User[] = users
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
      })
    
      
  return (
    <div className="">
      <table className="my-auto border">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr
              key={headerGroup.id}
              className="border-b text-gray-800 uppercase">
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-4 pr-2 py-4 font-medium text-left">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-b">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 pt-[14px] pb-[18px]">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div/>
    </div>
  )
}

export default ReactTable