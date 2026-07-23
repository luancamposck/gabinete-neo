// @/modules/fleet/shared/ui/drivers/drivers-explorer.tsx
"use client"

import { rankItem } from "@tanstack/match-sorter-utils"
import { type FilterFn, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { LayoutGrid, Table as TableIcon } from "lucide-react"
import { useEffect, useState } from "react"
import type { FleetDriverForTableDTO } from "@/modules/fleet/shared/types/flows/get-fleet-drivers-for-table.types"
import { DriversCards } from "@/modules/fleet/shared/ui/drivers/drivers-cards"
import { driversColumns } from "@/modules/fleet/shared/ui/drivers/drivers-columns"
import { DriversEmptyState } from "@/modules/fleet/shared/ui/drivers/drivers-empty-state"
import { DriversTable } from "@/modules/fleet/shared/ui/drivers/drivers-table"
import { DriversToolbar } from "@/modules/fleet/shared/ui/drivers/drivers-toolbar"
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { useIsMobile } from "@/shared/hooks/use-mobile"
import { usePersistedTableState } from "@/shared/hooks/use-persisted-table-state"

type DriversExplorerProps = {
	drivers: FleetDriverForTableDTO[]
}

type ViewMode = "table" | "cards"

const TABLE_STORAGE_KEY = "fleet-drivers-table-state"
const VIEW_MODE_STORAGE_KEY = "fleet-drivers-view-mode"

const fuzzyFilter: FilterFn<FleetDriverForTableDTO> = (row, _columnId, value, addMeta) => {
	const name = row.original.member.name
	const email = row.original.member.email
	const plate = row.original.plate
	const haystack = `${name} ${email} ${plate}`.trim()

	const itemRank = rankItem(haystack, String(value))
	addMeta?.({ itemRank })
	return itemRank.passed
}

const getInitialViewMode = (): ViewMode => {
	if (typeof window === "undefined") return "table"
	const saved = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
	return saved === "cards" ? saved : "table"
}

export const DriversExplorer = ({ drivers }: DriversExplorerProps) => {
	const isMobile = useIsMobile()
	const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode)
	const [globalFilter, setGlobalFilter] = useState("")
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

	// Sem toggle de visibilidade de colunas nesta tela (só 5 colunas, todas
	// essenciais para a consulta) — não há UI que consuma columnVisibility.
	const { sorting, setSorting, columnFilters, setColumnFilters } = usePersistedTableState({
		storageKey: TABLE_STORAGE_KEY,
		initialState: {
			sorting: [{ id: "approvedAt", desc: true }]
		}
	})

	useEffect(() => {
		window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
	}, [viewMode])

	const resetPageIndex = () => {
		setPagination((previous) => (previous.pageIndex === 0 ? previous : { ...previous, pageIndex: 0 }))
	}

	const table = useReactTable({
		data: drivers,
		columns: driversColumns,
		getRowId: (row) => row.driverId,
		filterFns: { fuzzy: fuzzyFilter },
		globalFilterFn: fuzzyFilter,
		state: { sorting, columnFilters, globalFilter, pagination },
		onSortingChange: (updater) => {
			setSorting(updater)
			resetPageIndex()
		},
		onColumnFiltersChange: (updater) => {
			setColumnFilters(updater)
			resetPageIndex()
		},
		onGlobalFilterChange: (updater) => {
			setGlobalFilter(updater)
			resetPageIndex()
		},
		onPaginationChange: setPagination,
		autoResetPageIndex: false,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues()
	})

	if (drivers.length === 0) {
		return <DriversEmptyState />
	}

	// No mobile forçamos cards, mesmo padrão do explorer de candidaturas.
	const effectiveView: ViewMode = isMobile ? "cards" : viewMode
	const filteredCount = table.getFilteredRowModel().rows.length

	return (
		<div className="w-full space-y-4">
			<div className="flex flex-wrap items-start justify-between gap-2">
				<DriversToolbar table={table} />

				{!isMobile && (
					<Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="ml-auto">
						<TabsList>
							<TabsTrigger value="table">
								<TableIcon className="size-4" />
								<span className="hidden sm:inline">Tabela</span>
							</TabsTrigger>
							<TabsTrigger value="cards">
								<LayoutGrid className="size-4" />
								<span className="hidden sm:inline">Cards</span>
							</TabsTrigger>
						</TabsList>
					</Tabs>
				)}
			</div>

			<p className="text-sm font-medium text-muted-foreground">
				{filteredCount} {filteredCount === 1 ? "motorista" : "motoristas"}
			</p>

			{effectiveView === "table" && <DriversTable table={table} />}
			{effectiveView === "cards" && <DriversCards rows={table.getRowModel().rows} />}

			<DataTablePagination table={table} showSelectionCount={false} />
		</div>
	)
}
