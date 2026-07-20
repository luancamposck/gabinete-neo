import { CircleCheck } from "lucide-react"

// Fila zerada: estado positivo (nada pendente), não um "vazio" de erro.
export const ApplicationsEmptyState = () => {
	return (
		<div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card/50 px-6 py-16 text-center">
			<span className="flex size-11 items-center justify-center rounded-full bg-success-subtle text-success-subtle-foreground">
				<CircleCheck aria-hidden className="size-6" />
			</span>
			<div className="space-y-1">
				<p className="text-sm font-medium">Tudo em dia</p>
				<p className="text-sm text-muted-foreground">Nenhuma candidatura de motorista pendente no momento.</p>
			</div>
		</div>
	)
}
