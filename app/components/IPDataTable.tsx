"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface IPData {
  ip: string
  country: string
  region: string
  city: string
  isp: string
  org: string
  as: string
  reputation?: {
    status: 'clean' | 'suspicious' | 'malicious'
    confidence_score?: number
    sources?: string[]
    last_reported?: string
    details?: string
    risk_factors?: string[]
    threat_categories?: string[]
    recommendations?: string[]
  }
}

const columns: ColumnDef<IPData>[] = [
  {
    accessorKey: "ip",
    header: "IP Address",
  },
  {
    accessorKey: "reputation",
    header: "Reputation",
    cell: ({ row }) => {
      const reputation = row.original.reputation
      if (!reputation) return <span className="text-muted">Unknown</span>

      const statusColors = {
        clean: "bg-green-500/20 text-green-700 dark:text-green-400",
        suspicious: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
        malicious: "bg-red-500/20 text-red-700 dark:text-red-400"
      }

      return (
        <div className="space-y-2">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[reputation.status]}`}>
            {reputation.status.charAt(0).toUpperCase() + reputation.status.slice(1)}
            {reputation.confidence_score && ` (${reputation.confidence_score}%)`}
          </div>
          {reputation.threat_categories && reputation.threat_categories.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Threats: {reputation.threat_categories.join(", ")}
            </div>
          )}
          {reputation.details && (
            <div className="text-xs text-muted-foreground">
              {reputation.details}
            </div>
          )}
          <div className="text-xs space-y-1">
            {reputation.risk_factors && reputation.risk_factors.length > 0 && (
              <details className="text-xs">
                <summary className="font-medium cursor-pointer hover:text-accent-foreground">
                  Risk Factors
                </summary>
                <ul className="mt-1 list-disc list-inside">
                  {reputation.risk_factors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </details>
            )}
            {reputation.recommendations && reputation.recommendations.length > 0 && (
              <details className="text-xs">
                <summary className="font-medium cursor-pointer hover:text-accent-foreground">
                  Recommendations
                </summary>
                <ul className="mt-1 list-disc list-inside">
                  {reputation.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "isp",
    header: "ISP",
  },
  {
    accessorKey: "org",
    header: "Organization",
  },
  {
    accessorKey: "as",
    header: "AS",
  },
]

export function IPDataTable({ data }: { data: IPData[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter IP addresses..."
        value={(table.getColumn("ip")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("ip")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

