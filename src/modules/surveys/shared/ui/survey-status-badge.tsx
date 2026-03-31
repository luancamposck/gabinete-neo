import { Badge } from "@/shared/components/ui/badge"

type SurveyStatus = "draft" | "published" | "closed"

type SurveyStatusBadgeProps = {
	status: SurveyStatus
}

const STATUS_LABELS: Record<SurveyStatus, string> = {
	draft: "Draft",
	published: "Published",
	closed: "Closed"
}

const STATUS_VARIANTS: Record<SurveyStatus, "secondary" | "default" | "outline"> = {
	draft: "secondary",
	published: "default",
	closed: "outline"
}

export const SurveyStatusBadge = ({ status }: SurveyStatusBadgeProps) => {
	return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
}
