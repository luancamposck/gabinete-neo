"use client"

import { flexRender, type Table } from "@tanstack/react-table"
import type { PendingDriverApplicationDTO } from "@/modules/fleet/shared/types/flows/get-pending-driver-applications.types"
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table as UITable } from "@/shared/components/ui/table"

type ApplicationsTableProps = {
	table: Table<PendingDriverApplicationDTO>
}

export const ApplicationsTable = ({ table }: ApplicationsTableProps) => {
	return (
		<div className="overflow-x-auto rounded-md border bg-card">
			<UITable>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id} colSpan={header.colSpan}>
									{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.length > 0 ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={table.getAllColumns().length} className="h-24 text-center text-sm text-muted-foreground">
								Nenhuma candidatura para os filtros atuais.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</UITable>
		</div>
	)
}
