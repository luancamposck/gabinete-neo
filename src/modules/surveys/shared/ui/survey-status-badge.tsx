import type { SurveyStatus, SurveyVisibility } from "@/modules/surveys/shared/types/db"
import { Badge } from "@/shared/components/ui/badge"

type SurveyBadgeVariant = "secondary" | "default" | "outline"

type SurveyStatusBadgeProps = {
	status: SurveyStatus
}

type SurveyVisibilityBadgeProps = {
	visibility: SurveyVisibility
}

const STATUS_LABELS: Record<SurveyStatus, string> = {
	draft: "Rascunho",
	published: "Publicada",
	closed: "Encerrada"
}

const STATUS_VARIANTS: Record<SurveyStatus, SurveyBadgeVariant> = {
	draft: "outline",
	published: "default",
	closed: "secondary"
}

const VISIBILITY_LABELS: Record<SurveyVisibility, string> = {
	public: "Pública",
	private: "Privada"
}

const VISIBILITY_VARIANTS: Record<SurveyVisibility, SurveyBadgeVariant> = {
	public: "default",
	private: "outline"
}

export const SurveyStatusBadge = ({ status }: SurveyStatusBadgeProps) => {
	return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
}

export const SurveyVisibilityBadge = ({ visibility }: SurveyVisibilityBadgeProps) => {
	return <Badge variant={VISIBILITY_VARIANTS[visibility]}>{VISIBILITY_LABELS[visibility]}</Badge>
}
