"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import type { PendingDriverApplicationDTO } from "@/modules/fleet/shared/types/flows/get-pending-driver-applications.types"
import type { ApplicationReviewControls } from "@/modules/fleet/shared/ui/applications/application-inline-actions"
import { ApplicationInlineActions } from "@/modules/fleet/shared/ui/applications/application-inline-actions"
import { ApplicationAgeBadge, ApplicationDocuments, formatApplicationDate, VehicleTypeBadge } from "@/modules/fleet/shared/ui/applications/application-visuals"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"

const getControls = (meta: unknown) => meta as ApplicationReviewControls

export const applicationsColumns: ColumnDef<PendingDriverApplicationDTO>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Selecionar todas as candidaturas da página"
				className="translate-y-[2px]"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label={`Selecionar candidatura de ${row.original.candidate?.name ?? "candidato"}`}
				className="translate-y-[2px]"
			/>
		),
		enableSorting: false,
		enableHiding: false
	},
	{
		id: "candidate",
		accessorFn: (row) => row.candidate?.name ?? "",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 has-[>svg]:px-0">
				Candidato
				<ArrowUpDown className="ml-2 size-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="flex flex-col">
				<span className="text-sm font-medium">{row.original.candidate?.name ?? "Candidato desconhecido"}</span>
				<span className="text-xs text-muted-foreground">{row.original.candidate?.email ?? "—"}</span>
			</div>
		),
		enableHiding: false
	},
	{
		accessorKey: "plate",
		header: "Placa",
		cell: ({ row }) => <span className="font-mono text-sm font-medium tracking-wide uppercase">{row.original.plate}</span>
	},
	{
		accessorKey: "vehicleType",
		header: "Tipo",
		// -ml-2 cancela o px-2 interno do Badge para alinhar o conteúdo visível
		// com o texto do header (que não tem esse padding extra).
		cell: ({ row }) => <VehicleTypeBadge type={row.original.vehicleType} className="-ml-2" />,
		filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id)))
	},
	{
		accessorKey: "vehicleModel",
		header: "Modelo",
		cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.vehicleModel ?? "—"}</span>
	},
	{
		accessorKey: "vehicleYear",
		header: "Ano",
		cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.vehicleYear ?? "—"}</span>
	},
	{
		accessorKey: "vehicleColor",
		header: "Cor",
		cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.vehicleColor ?? "—"}</span>
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 has-[>svg]:px-0">
				Enviada em
				<ArrowUpDown className="ml-2 size-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{formatApplicationDate(row.original.createdAt)}</span>
				<ApplicationAgeBadge createdAt={row.original.createdAt} />
			</div>
		)
	},
	{
		id: "documents",
		header: "Documentos",
		cell: ({ row, table }) => <ApplicationDocuments application={row.original} onPreview={getControls(table.options.meta).onPreviewDocument} />,
		enableSorting: false
	},
	{
		id: "actions",
		header: "",
		cell: ({ row, table }) => {
			const controls = getControls(table.options.meta)
			return (
				<ApplicationInlineActions
					applicationId={row.original.applicationId}
					candidateName={row.original.candidate?.name ?? "este candidato"}
					controls={controls}
					layout="compact"
					className="flex items-center justify-end gap-2"
				/>
			)
		},
		enableSorting: false,
		enableHiding: false
	}
]

export const applicationsColumnNameMap: Record<string, string> = {
	candidate: "Candidato",
	plate: "Placa",
	vehicleType: "Tipo",
	vehicleModel: "Modelo",
	vehicleYear: "Ano",
	vehicleColor: "Cor",
	createdAt: "Enviada em",
	documents: "Documentos"
}
