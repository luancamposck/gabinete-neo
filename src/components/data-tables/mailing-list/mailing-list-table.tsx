"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table"
import { useState } from "react"

import { getMailingList } from "@/actions/mailing-list"
import { columns } from "@/components/data-tables/mailing-list/columns"
import { MailingListTableToolbar } from "@/components/data-tables/mailing-list/mailing-list-table-toolbar"
import { DataTable } from "@/components/ui/data-table"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"

const MAILING_LIST_TABLE_STORAGE_KEY = "mailing-list-table-state"

const MailingListTable = () => {
  const [rowSelection, setRowSelection] = useState({})

  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility
  } = usePersistedTableState({
    storageKey: MAILING_LIST_TABLE_STORAGE_KEY,
    initialState: {
      columnVisibility: {
        id: false,
        user_id: false,
        seller_id: false,
        contact_email: false,
        cep: false,
        street: false,
        number: false,
        complement: false,
        neighborhood: false,
        updated_at: false
      },
      sorting: [{ id: "created_at", desc: true }]
    }
  })

  const { data, isLoading } = useQuery({
    queryKey: ["mailing-list"],
    queryFn: async () => {
      const res = await getMailingList()
      if (!res.success) throw new Error(res.message)
      return res.data
    }
  })

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  })

  const columnNameMap: { [key: string]: string } = {
    name: "Nome",
    phone_number: "Telefone",
    postal_code: "CEP",
    street: "Logradouro",
    number: "Número",
    complement: "Complemento",
    neighborhood: "Bairro",
    city: "Cidade",
    state: "Estado",
    created_at: "Criado em"
  }

  const toolbar = (
    <div className="flex items-center justify-between">
      <MailingListTableToolbar table={table} />
      <DataTableViewOptions table={table} columnNameMap={columnNameMap} />
    </div>
  )

  if (isLoading) {
    return <DataTableSkeleton columnCount={6} />
  }

  return <DataTable table={table} toolbar={toolbar} />
}

export { MailingListTable }
