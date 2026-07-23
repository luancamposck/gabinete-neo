// @/modules/fleet/shared/ui/drivers/driver-status-badge.tsx

import { Circle } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Badge } from "@/shared/components/ui/badge"

type DriverStatusBadgeProps = {
	isActive: boolean
	className?: string
}

// Ativo/inativo é estado, não julgamento — inativo usa tom neutro (secondary),
// nunca destructive. Só "ativo" ganha destaque semântico (success-subtle).
export const DriverStatusBadge = ({ isActive, className }: DriverStatusBadgeProps) => {
	if (isActive) {
		return (
			<Badge className={cn("border-transparent bg-success-subtle text-success-subtle-foreground", className)}>
				<Circle aria-hidden className="size-2 fill-current" />
				Ativo
			</Badge>
		)
	}

	return (
		<Badge variant="secondary" className={className}>
			<Circle aria-hidden className="size-2 fill-current" />
			Inativo
		</Badge>
	)
}
