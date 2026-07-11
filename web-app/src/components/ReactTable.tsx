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
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <table className="my-auto w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/80">
          {table.getHeaderGroups().map(headerGroup => (
            <tr
              key={headerGroup.id}
              className="border-0 text-slate-600 dark:text-slate-300">
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
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
            <tr key={row.id} className="border-b border-slate-200/90 text-slate-700 transition-colors hover:bg-blue-50/60 dark:border-slate-800/90 dark:text-slate-200 dark:hover:bg-blue-950/30">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-3">
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
