// @/modules/fleet/shared/ui/vehicle-preview-card.tsx

import { cn } from "@/lib/utils/cn"
import type { VehicleType } from "@/modules/fleet/shared/types/db"
import { VehicleTypeBadge } from "@/modules/fleet/shared/ui/applications/application-visuals"

type VehiclePreviewCardProps = {
	plate: string
	vehicleType: VehicleType | undefined
	model: string | undefined
	year: number | undefined
	color: string | undefined
	className?: string
}

const PreviewField = ({ label, value, className }: { label: string; value: string | number | undefined; className?: string }) => (
	<div className={className}>
		<dt className="text-xs text-muted-foreground">{label}</dt>
		<dd className="text-sm font-medium">{value || "—"}</dd>
	</div>
)

// Painel tonal (não um Card com borda/sombra próprias) para não ler como uma caixa flutuando
// dentro do form — fica encostado nos campos de veículo que resume, como uma anotação viva.
export const VehiclePreviewCard = ({ plate, vehicleType, model, year, color, className }: VehiclePreviewCardProps) => {
	const hasData = Boolean(plate || vehicleType || model || year || color)

	return (
		<div className={cn("rounded-lg border-l-2 border-primary/40 bg-muted/40 p-4", className)}>
			<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Pré-visualização</p>

			{hasData ? (
				<div className="mt-3 space-y-3">
					<div className="flex items-center justify-between gap-2">
						{plate ? <span className="font-mono text-xl font-semibold tracking-wider">{plate}</span> : <span className="text-sm text-muted-foreground">Placa não informada</span>}
						{vehicleType && <VehicleTypeBadge type={vehicleType} />}
					</div>

					<dl className="grid grid-cols-2 gap-x-3 gap-y-2">
						<PreviewField label="Modelo" value={model} className="col-span-2" />
						<PreviewField label="Ano" value={year} />
						<PreviewField label="Cor" value={color} />
					</dl>
				</div>
			) : (
				<p className="mt-3 text-sm text-muted-foreground">Os dados do veículo aparecem aqui conforme você preenche o formulário.</p>
			)}
		</div>
	)
}
