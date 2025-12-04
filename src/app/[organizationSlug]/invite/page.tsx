// src/app/[organizationSlug]/invite/page.tsx
import Image from "next/image"

import { CreateUserWithInvitationForm } from "@/components/forms/organization-invite/create-user-with-Invitation-form"
import { Card } from "@/components/ui/card"
import { verifyInviteToken } from "@/lib/utils/token-utils"
import { getOrganizationDataByOrganizationIdService } from "@/services/organization"
import { getPublicUserByUserIdService } from "@/services/users/get-public-user-by-user-id.service"

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
		<div className="flex w-full flex-col items-center gap-6 pt-8">
			<h1 className="text-xl font-semibold">Convite para constelação</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				Você foi convidado por {inviterUserName} para entrar na constelação {organizationName}
			</p>
			<Card className="grid grid-cols-2 p-0">
				<CreateUserWithInvitationForm inviteToken={token} />

				<div className="bg-muted hidden md:flex md:flex-col md:justify-center md:items-center">
					<Image src="/logo.png" width={300} height={300} alt="Gabinete NEO" />
					<h1 className="text-3xl font-semibold text-center">Gabinete NEO</h1>
				</div>
			</Card>
		</div>
	)
}
