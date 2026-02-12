type PermissionPresentationInput = {
	key: string
	description?: string | null
}

type PermissionPresentation = {
	label: string
	description: string
	technicalKey: string
}

const FRIENDLY_PERMISSION_LABELS: Record<string, string> = {
	"org.admin.read": "Visualizar configurações da organização",
	"org.admin.update": "Editar configurações da organização",
	"users.read": "Visualizar usuários da organização",
	"roles.read": "Visualizar cargos",
	"roles.update": "Editar cargos",
	"org.membership.role.update": "Alterar cargo de membros",
	"org.membership.role.update.privileged": "Alterar cargos privilegiados",
	"org.membership.status.update": "Alterar status de membros",
	"org.membership.status.update.privileged": "Alterar status de membros privilegiados"
}

const FALLBACK_ACTION_LABELS: Record<string, string> = {
	read: "Visualizar",
	update: "Atualizar",
	create: "Criar",
	delete: "Excluir"
}

const FALLBACK_SUBJECT_LABELS: Record<string, string> = {
	admin: "configurações da organização",
	roles: "cargos",
	membership: "membros",
	role: "cargo",
	status: "status",
	privileged: "privilegiados",
	org: "organização"
}

const normalizeDescription = (description?: string | null) => {
	if (typeof description !== "string") {
		return null
	}

	const normalized = description.trim()
	return normalized.length > 0 ? normalized : null
}

const buildFallbackLabel = (permissionKey: string) => {
	const segments = permissionKey.split(".").filter((segment) => segment !== "org")
	const actionSegment = segments[segments.length - 1] ?? "read"
	const actionLabel = FALLBACK_ACTION_LABELS[actionSegment] ?? "Gerenciar"
	const subjectSegments = segments.slice(0, -1)

	const subjectLabel = subjectSegments
		.map((segment) => FALLBACK_SUBJECT_LABELS[segment] ?? segment)
		.join(" ")
		.trim()

	if (!subjectLabel) {
		return `${actionLabel} recurso`
	}

	return `${actionLabel} ${subjectLabel}`
}

export const getPermissionPresentation = (permission: PermissionPresentationInput): PermissionPresentation => {
	const technicalKey = permission.key
	const label = FRIENDLY_PERMISSION_LABELS[technicalKey] ?? buildFallbackLabel(technicalKey)
	const description = normalizeDescription(permission.description) ?? `Permissão do sistema para ${label.toLowerCase()}.`

	return {
		label,
		description,
		technicalKey
	}
}
