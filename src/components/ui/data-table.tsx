"use client"

import { flexRender, type Table } from "@tanstack/react-table"
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table as UITable } from "@/components/ui/table"
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination"

interface DataTableProps<TData> {
	table: Table<TData>
	toolbar?: React.ReactNode
}

export const DataTable = <TData,>({ table, toolbar }: DataTableProps<TData>) => {
	return (
		<div className="w-full space-y-4">
			{toolbar}
			<div className="rounded-md border bg-card">
				<UITable>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
									Nenhum resultado.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</UITable>
			</div>
			<DataTablePagination table={table} />
		</div>
	)
}
