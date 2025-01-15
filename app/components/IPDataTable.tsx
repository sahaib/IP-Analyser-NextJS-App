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
  Row
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { IPData } from "@/app/types/ip"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

export function IPDataTable({ data }: { data: IPData[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = [
    {
      accessorKey: 'ip',
      header: 'IP Address'
    },
    {
      accessorKey: 'ipInfo.country',
      header: 'Country'
    },
    {
      accessorKey: 'ipInfo.region',
      header: 'Region'
    },
    {
      accessorKey: 'ipInfo.city',
      header: 'City'
    },
    {
      accessorKey: 'ipInfo.isp',
      header: 'ISP'
    },
    {
      accessorKey: 'ipInfo.org',
      header: 'Organization'
    },
    {
      accessorKey: 'ipInfo.as',
      header: 'AS'
    },
    {
      accessorKey: 'reputation',
      header: 'Reputation',
      cell: ({ row }: { row: Row<IPData> }) => {
        const reputation = row.getValue('reputation') as {
          status?: string;
          confidence_score?: number;
          details?: string;
        } | null
        
        if (!reputation) return 'N/A'
        
        const getStatusColor = (status?: string) => {
          switch(status?.toLowerCase()) {
            case 'clean':
              return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'suspicious':
              return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            case 'malicious':
              return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default:
              return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
          }
        }
        
        return (
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium",
                getStatusColor(reputation.status)
              )}>
                {reputation.status || 'Unknown'}
              </span>
              {reputation.confidence_score && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {reputation.confidence_score}%
                </span>
              )}
            </div>
            {reputation.details && (
              <Card className="p-2 text-sm text-muted-foreground bg-muted/50">
                {reputation.details}
              </Card>
            )}
          </div>
        )
      }
    }
  ]

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

