"use client"

import type { Row } from "@tanstack/react-table"
import { cn } from "@/lib/utils/cn"
import type { PendingDriverApplicationDTO } from "@/modules/fleet/shared/types/slices/get-pending-driver-applications.types"
import type { ApplicationReviewControls } from "@/modules/fleet/shared/ui/applications/application-inline-actions"
import { ApplicationInlineActions } from "@/modules/fleet/shared/ui/applications/application-inline-actions"
import { ApplicationAgeBadge, ApplicationDocuments, formatApplicationDate, VehicleTypeBadge } from "@/modules/fleet/shared/ui/applications/application-visuals"
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card"
import { Checkbox } from "@/shared/components/ui/checkbox"

type ApplicationsCardsProps = {
	rows: Row<PendingDriverApplicationDTO>[]
	controls: ApplicationReviewControls
}

const DetailField = ({ label, value }: { label: string; value: string | number | null }) => (
	<div className="flex flex-col gap-0.5">
		<dt className="text-xs text-muted-foreground">{label}</dt>
		<dd className="text-sm font-medium">{value ?? "—"}</dd>
	</div>
)

export const ApplicationsCards = ({ rows, controls }: ApplicationsCardsProps) => {
	if (rows.length === 0) {
		return <div className="rounded-md border bg-card p-10 text-center text-sm text-muted-foreground">Nenhuma candidatura para os filtros atuais.</div>
	}

	return (
		<ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{rows.map((row) => {
				const application = row.original
				const candidateName = application.candidate?.name ?? "Candidato desconhecido"
				const isSelected = row.getIsSelected()

				return (
					<li key={row.id}>
						<Card className={cn("h-full gap-4 transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none", isSelected && "border-primary ring-1 ring-primary")}>
							<CardHeader className="gap-2">
								<div className="flex items-start justify-between gap-3">
									<div className="flex min-w-0 items-start gap-3">
										<Checkbox checked={isSelected} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label={`Selecionar candidatura de ${candidateName}`} className="mt-1" />
										<span className="flex min-w-0 flex-col">
											<span className="truncate text-base leading-none font-semibold">{candidateName}</span>
											<span className="mt-1 truncate text-sm text-muted-foreground">{application.candidate?.email ?? "—"}</span>
										</span>
									</div>
									<VehicleTypeBadge type={application.vehicleType} />
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<span className="font-mono text-sm font-medium tracking-wide uppercase">{application.plate}</span>
									<span aria-hidden className="text-muted-foreground/50">
										·
									</span>
									<ApplicationAgeBadge createdAt={application.createdAt} />
								</div>
							</CardHeader>

							<CardContent className="space-y-4">
								<dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
									<DetailField label="Modelo" value={application.vehicleModel} />
									<DetailField label="Ano" value={application.vehicleYear} />
									<DetailField label="Cor" value={application.vehicleColor} />
									<DetailField label="Enviada em" value={formatApplicationDate(application.createdAt)} />
								</dl>

								<ApplicationDocuments application={application} onPreview={controls.onPreviewDocument} />
							</CardContent>

							<CardFooter>
								<ApplicationInlineActions applicationId={application.applicationId} candidateName={candidateName} controls={controls} className="flex w-full items-center gap-2 [&>button]:flex-1" />
							</CardFooter>
						</Card>
					</li>
				)
			})}
		</ul>
	)
}
