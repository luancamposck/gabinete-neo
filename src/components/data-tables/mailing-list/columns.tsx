"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import type { MailingListTable } from "@/lib/definitions/mailing-list"
import { getFirstAndLastName } from "@/lib/utils"
import { formatDate, formatPhone } from "@/lib/utils/formatters"

export const columns: ColumnDef<MailingListTable>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Razão Social
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const fullName = row.getValue("legal_business_name") as string
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="font-medium text-left cursor-pointer">
              {getFirstAndLastName(fullName)}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{fullName}</p>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    accessorKey: "phone_number",
    header: "Celular",
    cell: ({ row }) => formatPhone(String(row.original.phone_number))
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data da Solicitação
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return formatDate(row.getValue("created_at"))
    }
  },
  {
    accessorKey: "city",
    header: "Cidade",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: "state",
    header: "Estado",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  }
]
