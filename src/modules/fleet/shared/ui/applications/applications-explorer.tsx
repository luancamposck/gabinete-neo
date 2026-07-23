"use client"

import { rankItem } from "@tanstack/match-sorter-utils"
import { type FilterFn, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { Columns2, LayoutGrid, Table as TableIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { PendingDriverApplicationDTO } from "@/modules/fleet/shared/types/flows/get-pending-driver-applications.types"
import type { ApplicationReviewControls } from "@/modules/fleet/shared/ui/applications/application-inline-actions"
import { ApplicationReviewCockpit } from "@/modules/fleet/shared/ui/applications/application-review-cockpit"
import type { PreviewDocument } from "@/modules/fleet/shared/ui/applications/application-visuals"
import { ApplicationsBulkActionBar } from "@/modules/fleet/shared/ui/applications/applications-bulk-action-bar"
import { ApplicationsCards } from "@/modules/fleet/shared/ui/applications/applications-cards"
import { applicationsColumnNameMap, applicationsColumns } from "@/modules/fleet/shared/ui/applications/applications-columns"
import { ApplicationsEmptyState } from "@/modules/fleet/shared/ui/applications/applications-empty-state"
import { ApplicationsTable } from "@/modules/fleet/shared/ui/applications/applications-table"
import { ApplicationsToolbar } from "@/modules/fleet/shared/ui/applications/applications-toolbar"
import { DocumentPreviewSheet } from "@/modules/fleet/shared/ui/applications/document-preview-sheet"
import { useApplicationReview } from "@/modules/fleet/shared/ui/applications/use-application-review"
import { usePersistedApplicationsTableState } from "@/modules/fleet/shared/ui/applications/use-persisted-applications-table-state"
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination"
import { DataTableViewOptions } from "@/shared/components/ui/data-table-view-options"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { useIsMobile } from "@/shared/hooks/use-mobile"

type ApplicationsExplorerProps = {
	applications: PendingDriverApplicationDTO[]
}

type ViewMode = "table" | "cards" | "cockpit"

const TABLE_STORAGE_KEY = "fleet-applications-table-state"
const VIEW_MODE_STORAGE_KEY = "fleet-applications-view-mode"

const fuzzyFilter: FilterFn<PendingDriverApplicationDTO> = (row, _columnId, value, addMeta) => {
	const name = row.original.candidate?.name ?? ""
	const email = row.original.candidate?.email ?? ""
	const plate = row.original.plate
	const haystack = `${name} ${email} ${plate}`.trim()

	const itemRank = rankItem(haystack, String(value))
	addMeta?.({ itemRank })
	return itemRank.passed
}

const getInitialViewMode = (): ViewMode => {
	if (typeof window === "undefined") return "table"
	const saved = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
	return saved === "cards" || saved === "cockpit" ? saved : "table"
}

export const ApplicationsExplorer = ({ applications }: ApplicationsExplorerProps) => {
	const isMobile = useIsMobile()
	const [items, setItems] = useState(applications)
	const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode)
	const [rowSelection, setRowSelection] = useState({})
	const [globalFilter, setGlobalFilter] = useState("")
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
	const [previewDocument, setPreviewDocument] = useState<PreviewDocument | null>(null)

	const { sorting, setSorting, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility } = usePersistedApplicationsTableState({
		storageKey: TABLE_STORAGE_KEY,
		initialState: {
			sorting: [{ id: "createdAt", desc: false }],
			// Reduz a densidade da tabela por padrão; reativável via view-options.
			columnVisibility: { vehicleYear: false, vehicleColor: false }
		}
	})

	// Fonte da verdade da fila é o estado local: ao resolver (single/bulk) removemos
	// os ids com microtransição, sem depender de refetch. `revalidatePath` na action
	// mantém o servidor fresco para a próxima navegação.
	const resetPageIndex = useCallback(() => {
		setPagination((previous) => (previous.pageIndex === 0 ? previous : { ...previous, pageIndex: 0 }))
	}, [])

	const handleResolved = useCallback(
		(applicationIds: string[]) => {
			const resolved = new Set(applicationIds)
			setItems((previous) => previous.filter((application) => !resolved.has(application.applicationId)))
			setRowSelection((previous) => {
				const next = { ...previous } as Record<string, boolean>
				for (const applicationId of applicationIds) delete next[applicationId]
				return next
			})
			resetPageIndex()
		},
		[resetPageIndex]
	)

	const review = useApplicationReview({ onResolved: handleResolved })

	useEffect(() => {
		window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
	}, [viewMode])

	const controls = useMemo<ApplicationReviewControls>(
		() => ({
			approve: review.approve,
			reject: review.reject,
			pendingIds: review.pendingIds,
			onPreviewDocument: setPreviewDocument
		}),
		[review.approve, review.reject, review.pendingIds]
	)

	const table = useReactTable({
		data: items,
		columns: applicationsColumns,
		getRowId: (row) => row.applicationId,
		meta: controls,
		filterFns: { fuzzy: fuzzyFilter },
		globalFilterFn: fuzzyFilter,
		state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter, pagination },
		onSortingChange: (updater) => {
			setSorting(updater)
			resetPageIndex()
		},
		onColumnFiltersChange: (updater) => {
			setColumnFilters(updater)
			resetPageIndex()
		},
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
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

	if (items.length === 0) {
		return <ApplicationsEmptyState />
	}

	// No mobile forçamos cards; o cockpit (split) só faz sentido no desktop.
	const effectiveView: ViewMode = isMobile ? "cards" : viewMode
	const filteredCount = table.getFilteredRowModel().rows.length
	const selectedRows = table.getFilteredSelectedRowModel().rows
	const selectedIds = selectedRows.map((row) => row.original.applicationId)

	return (
		<div className="w-full space-y-4">
			<div className="flex flex-wrap items-start justify-between gap-2">
				<ApplicationsToolbar table={table} />

				{!isMobile && (
					<div className="ml-auto flex items-center gap-2">
						<Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
							<TabsList>
								<TabsTrigger value="table">
									<TableIcon className="size-4" />
									<span className="hidden sm:inline">Tabela</span>
								</TabsTrigger>
								<TabsTrigger value="cards">
									<LayoutGrid className="size-4" />
									<span className="hidden sm:inline">Cards</span>
								</TabsTrigger>
								<TabsTrigger value="cockpit">
									<Columns2 className="size-4" />
									<span className="hidden sm:inline">Cockpit</span>
								</TabsTrigger>
							</TabsList>
						</Tabs>
						{effectiveView === "table" && <DataTableViewOptions table={table} columnNameMap={applicationsColumnNameMap} />}
					</div>
				)}
			</div>

			<p className="text-sm font-medium text-muted-foreground">
				{filteredCount} {filteredCount === 1 ? "candidatura pendente" : "candidaturas pendentes"}
			</p>

			{effectiveView === "table" && <ApplicationsTable table={table} />}
			{effectiveView === "cards" && <ApplicationsCards rows={table.getRowModel().rows} controls={controls} />}
			{effectiveView === "cockpit" && <ApplicationReviewCockpit rows={table.getSortedRowModel().rows} controls={controls} />}

			{effectiveView !== "cockpit" && <DataTablePagination table={table} />}

			{/* Reserva espaço para a barra flutuante de lote não cobrir o último item. */}
			{selectedIds.length > 0 && <div aria-hidden className="h-14" />}

			<ApplicationsBulkActionBar
				selectedCount={selectedIds.length}
				isPending={review.isBulkPending}
				onApprove={() => review.approveMany(selectedIds)}
				onReject={() => review.rejectMany(selectedIds)}
				onClear={() => table.resetRowSelection()}
			/>

			<DocumentPreviewSheet document={previewDocument} onOpenChange={(open) => !open && setPreviewDocument(null)} />
		</div>
	)
}
