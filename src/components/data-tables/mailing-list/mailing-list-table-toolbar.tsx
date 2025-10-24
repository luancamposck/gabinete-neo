"use client"

import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { Input } from "@/components/ui/input"

import type { MailingListTable } from "@/lib/definitions/mailing-list"

interface MailingListTableToolbarProps<TData> {
  table: Table<TData>
}

export const MailingListTableToolbar = <TData,>({
  table
}: MailingListTableToolbarProps<TData>) => {
  const isFiltered = table.getState().columnFilters.length > 0

  const rows = table.getRowModel().rows

  const uniqueCities = useMemo(() => {
    const cities = new Set<string>()
    rows.forEach((row) => {
      const city = (row.original as MailingListTable).city
      if (city) cities.add(city)
    })
    return Array.from(cities).map((city) => ({ label: city, value: city }))
  }, [rows])

  const uniqueStates = useMemo(() => {
    const states = new Set<string>()
    rows.forEach((row) => {
      const state = (row.original as MailingListTable).state
      if (state) states.add(state)
    })
    return Array.from(states).map((state) => ({ label: state, value: state }))
  }, [rows])

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filtrar por Nome..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("state") && (
          <DataTableFacetedFilter
            column={table.getColumn("state")}
            title="Estado"
            options={uniqueStates}
          />
        )}
        {table.getColumn("city") && (
          <DataTableFacetedFilter
            column={table.getColumn("city")}
            title="Cidade"
            options={uniqueCities}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Limpar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
