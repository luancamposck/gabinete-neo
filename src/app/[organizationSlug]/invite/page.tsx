// src/app/[organizationSlug]/invite/page.tsx
import { CreateUserWithInvitationForm } from "@/components/forms/organization-invite/create-user-with-Invitation-form"
import { verifyInviteToken } from "@/lib/utils/token-utils"
import { getOrganizationDataByOrganizationIdService } from "@/services/get-organization-data-by-organization-id.service"
import { getPublicUserByUserIdService } from "@/services/get-public-user-by-user-id.service"

interface InvitePageProps {
	params: {
		organizationSlug: string
	}
	searchParams: {
		token?: string
	}
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
	const { token = "" } = await searchParams

	if (!token) {
		console.error("[InvitePage] Token ausente na URL")
		// Aqui você pode renderizar uma tela de erro simples
		return (
			<div className="p-4">
				<h1 className="text-xl font-semibold">Convite inválido</h1>
				<p className="text-sm text-muted-foreground mt-2">Link de convite sem token. Peça um novo link ao administrador.</p>
			</div>
		)
	}

	const decoded = await verifyInviteToken(token)

	if (!decoded) {
		return (
			<div className="p-4">
				<h1 className="text-xl font-semibold">Convite inválido ou expirado</h1>
				<p className="text-sm text-muted-foreground mt-2">Este link de convite não é mais válido. Solicite um novo convite ao administrador.</p>
			</div>
		)
	}

	const { inviterUserId, organizationId } = decoded

	const getPublicUserByUserIdServiceRes = await getPublicUserByUserIdService({ userId: inviterUserId })
	if (getPublicUserByUserIdServiceRes.success === false) {
		return
	}

	const inviterUserName = getPublicUserByUserIdServiceRes.data.user.name

	const getOrganizationDataByOrganizationIdServiceRes = await getOrganizationDataByOrganizationIdService({ organizationId })
	if (getOrganizationDataByOrganizationIdServiceRes.success === false) {
		return
	}

	const organizationName = getOrganizationDataByOrganizationIdServiceRes.data.organization.name

	// Dados do token:
	// decoded.organizationId
	// decoded.inviterUserId
	// decoded.kind

	return (
		<div className="p-4">
			<h1 className="text-xl font-semibold">Convite para organização</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				Você foi convidado por {inviterUserName} para entrar na organização {organizationName}
			</p>

			<CreateUserWithInvitationForm inviteToken={token} />
		</div>
	)
}
