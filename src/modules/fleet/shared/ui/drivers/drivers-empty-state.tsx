// @/modules/fleet/shared/ui/drivers/drivers-empty-state.tsx

import { Users } from "lucide-react"

// Frota sem motoristas aprovados ainda: neutro, não é "tudo em dia" (positivo)
// nem erro — é só o estado inicial antes da primeira aprovação.
export const DriversEmptyState = () => {
	return (
		<div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card/50 px-6 py-16 text-center">
			<span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<Users aria-hidden className="size-6" />
			</span>
			<div className="space-y-1">
				<p className="text-sm font-medium">Nenhum motorista aprovado</p>
				<p className="text-sm text-muted-foreground">Motoristas aparecem aqui assim que uma candidatura for aprovada.</p>
			</div>
		</div>
	)
}
