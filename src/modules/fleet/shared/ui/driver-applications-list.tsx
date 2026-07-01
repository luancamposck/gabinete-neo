import type { PendingDriverApplicationDTO } from "@/modules/fleet/server/slices/review-driver-applications/use-cases/get-pending-driver-applications.use-case"
import { VEHICLE_TYPE_LABELS } from "@/modules/fleet/shared/constants/vehicle-types"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

type DriverApplicationsListProps = {
	applications: PendingDriverApplicationDTO[]
}

const formatDate = (value: string) => {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) {
		return value
	}

	return date.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	})
}

export const DriverApplicationsList = ({ applications }: DriverApplicationsListProps) => {
	if (applications.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-8 text-center">
				<p className="text-sm text-muted-foreground">Nenhuma candidatura pendente no momento.</p>
			</div>
		)
	}

	return (
		<ul className="space-y-4">
			{applications.map((application) => (
				<li key={application.applicationId}>
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between gap-4">
								<div className="space-y-1">
									<CardTitle className="text-base">{application.candidate?.name ?? "Candidato desconhecido"}</CardTitle>
									<CardDescription>{application.candidate?.email ?? "—"}</CardDescription>
								</div>
								<Badge variant="secondary">{VEHICLE_TYPE_LABELS[application.vehicleType] ?? application.vehicleType}</Badge>
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							<dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
								<div>
									<dt className="text-muted-foreground">Placa</dt>
									<dd className="font-medium">{application.plate}</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Modelo</dt>
									<dd className="font-medium">{application.vehicleModel ?? "—"}</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Ano</dt>
									<dd className="font-medium">{application.vehicleYear ?? "—"}</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Cor</dt>
									<dd className="font-medium">{application.vehicleColor ?? "—"}</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Enviada em</dt>
									<dd className="font-medium">{formatDate(application.createdAt)}</dd>
								</div>
							</dl>

							<div className="flex flex-wrap gap-3 text-sm">
								{application.crlvSignedUrl ? (
									<a className="font-medium text-primary underline underline-offset-4" href={application.crlvSignedUrl} rel="noopener noreferrer" target="_blank">
										Ver CRLV
									</a>
								) : (
									<span className="text-muted-foreground">CRLV indisponível</span>
								)}

								{application.cnhSignedUrl ? (
									<a className="font-medium text-primary underline underline-offset-4" href={application.cnhSignedUrl} rel="noopener noreferrer" target="_blank">
										Ver CNH
									</a>
								) : (
									<span className="text-muted-foreground">CNH indisponível</span>
								)}
							</div>
						</CardContent>
					</Card>
				</li>
			))}
		</ul>
	)
}
