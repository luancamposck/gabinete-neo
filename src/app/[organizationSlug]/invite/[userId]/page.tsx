// src/app/[organizationSlug]/invite/[userId]/page.tsx

import Image from "next/image"

import { findOrganizationBySlugAction } from "@/actions/organization"
import { findOrganizationMembershipByUserAndOrganizationAction } from "@/actions/organization-membership"
import { findPublicUserByUserIdAction } from "@/actions/public-users"
// import { CreateUserWithInvitationForm } from "@/components/forms/organization-invite/create-user-with-Invitation-form"
import { Card } from "@/components/ui/card"

import { InviteError } from "./invite-error"

interface InvitePageProps {
	params: {
		organizationSlug: string
		userId: string
	}
}

export default async function InvitePage({ params }: InvitePageProps) {
	const { organizationSlug, userId } = await params

	// 1) Checar se o slug é real
	const findOrganizationBySlugActionRes = await findOrganizationBySlugAction({ organizationSlug })

	if (findOrganizationBySlugActionRes.success === false) {
		return <InviteError title="Ocorreu um erro ao carregar a constelação" description="Não foi possível buscar as informações da constelação. Tente novamente mais tarde ou peça um novo link ao responsável." />
	}

	// 1.5) Verificar se a org existe
	const organizationData = findOrganizationBySlugActionRes.data.organization

	if (!organizationData) {
		return <InviteError title="Constelação não encontrada" description={`A constelação com o identificador “${organizationSlug}” não existe ou foi removida.`} />
	}

	// 2) Verificar se o userId é real
	const findPublicUserByUserIdActionRes = await findPublicUserByUserIdAction({ userId })

	if (findPublicUserByUserIdActionRes.success === false) {
		return <InviteError title="Não foi possível carregar o convite" description="O usuário convidado não foi encontrado. O link pode estar incorreto, expirado ou o convite foi cancelado." />
	}

	// 2.5) Verificar se o user existe
	const userData = findPublicUserByUserIdActionRes.data.user
	if (!userData) {
		return <InviteError title="Usuário convidante não encontrado" description="O usuário que te convidou não existe ou foi removido da plataforma." />
	}

	// 3) Verificar se o userId pertence a organization
	const findOrganizationMembershipByUserAndOrganizationActionRes = await findOrganizationMembershipByUserAndOrganizationAction({
		userId: userData.id,
		organizationId: organizationData.id
	})

	if (findOrganizationMembershipByUserAndOrganizationActionRes.success === false) {
		return <InviteError title="Não foi possível buscar o usuário convidado" description="Ocorreu um erro ao verificar o vínculo do usuário com a constelação. Tente novamente mais tarde." />
	}

	// 3.5) Verificar se o membership existe
	const organizationMembershipData = findOrganizationMembershipByUserAndOrganizationActionRes.data.organizationMembership

	if (!organizationMembershipData) {
		return (
			<InviteError
				title="Convite inválido para esta constelação"
				description={`O usuário ${userData.name} não pertence à constelação ${organizationData.name}. Verifique se o link está correto ou peça um novo convite.`}
			/>
		)
	}

	// 4) Verificar se a role do membership permite convidar
	const inviterUserRole = organizationMembershipData.role
	if (inviterUserRole !== "OWNER" && inviterUserRole !== "ADMIN") {
		return (
			<InviteError
				title="Usuário sem permissão para convidar"
				description="A pessoa que te enviou este link não possui permissão para convidar novos membros nesta constelação. Peça um convite ao responsável ou administrador."
			/>
		)
	}

	// 5) Pegar dados para usar na UI
	const inviterUserId = userData.id
	const inviterUserName = userData.name
	const organizationId = organizationData.id
	const organizationName = organizationData.name

	return (
		// Form para criar user
		<div className="flex w-full flex-col items-center gap-6 pt-8">
			<h1 className="text-xl font-semibold">Convite para constelação</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				Você foi convidado por {inviterUserName} para entrar na constelação {organizationName}
			</p>
			<Card className="grid grid-cols-2 p-0">
				{/* <CreateUserWithInvitationForm inviterUserId={inviterUserId} organizationId={organizationId} /> */}

				<div className="bg-muted hidden md:flex md:flex-col md:justify-center md:items-center">
					<Image src="/logo.png" width={300} height={300} alt="Gabinete NEO" />
					<h1 className="text-3xl font-semibold text-center">Gabinete NEO</h1>
				</div>
			</Card>
		</div>
	)
}
