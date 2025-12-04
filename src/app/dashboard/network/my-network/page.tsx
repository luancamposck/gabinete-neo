// src/app/dashboard/network/my-network/page.tsx
import { redirect } from "next/navigation"
import { OrganizationInvitesTable } from "@/components/data-tables/organization-invites/organization-invites-table"
import { InviteLinkBox } from "@/components/invite-link-box"
import { createClient } from "@/lib/supabase/server"
import { findOrganizationMembershipByUserRepo } from "@/repositories/organization-menberships/organization-menberships.repo"
import { listOrganizationInvitesService } from "@/services/organization-invite/list-organization-invites.service"

const MyNetworkPage = async () => {
	// 1) Garante usuário logado
	const supabase = await createClient()
	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user) {
		redirect("/sign-in")
	}

	const userId = user.id

	// 2) Busca membership ativa do usuário (1 user -> 1 org)
	const { data: membership, error: membershipError } = await findOrganizationMembershipByUserRepo({
		userId
	})

	if (membershipError) {
		console.error("[MyNetworkPage] erro ao buscar membership:", membershipError)

		return (
			<div className="p-4">
				<header className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Minha Rede de Contatos</h1>
					<p className="text-sm text-muted-foreground">Confira aqui toda a sua rede de contatos, crie links de convites e aprove usuários interessados.</p>
				</header>

				<p className="mt-6 text-sm text-destructive">Algo deu errado ao carregar sua organização. Tente novamente em alguns instantes.</p>
			</div>
		)
	}

	if (!membership) {
		// User logado mas sem org ativa
		redirect("/no-organization")
	}

	const organizationId = membership.organization_id

	// 3) Buscar organização para pegar o slug
	const { data: organization, error: organizationError } = await supabase.from("organizations").select("id, slug, name").eq("id", organizationId).maybeSingle()

	if (organizationError) {
		console.error("[MyNetworkPage] erro ao buscar organização:", organizationError)
	}

	if (!organization?.slug) {
		console.error("[MyNetworkPage] organização sem slug ou não encontrada.")
	}

	const organizationSlug = organization?.slug ?? ""

	// 4) Busca todos os invites dessa organização via service
	const invitesRes = await listOrganizationInvitesService({ organizationId })

	if (!invitesRes.success || !invitesRes.data) {
		return (
			<div className="p-4 space-y-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Minha Rede de Contatos</h1>
					<p className="text-sm text-muted-foreground">Confira aqui toda a sua rede de contatos, crie links de convites e aprove usuários interessados.</p>
				</header>

				{organizationSlug && <InviteLinkBox organizationId={organizationId} organizationSlug={organizationSlug} className="max-w-xl" />}

				<p className="text-sm text-destructive">{invitesRes.message ?? "Não foi possível carregar os convites desta organização."}</p>
			</div>
		)
	}

	const invites = invitesRes.data.invites

	return (
		<div className="p-4 space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Meus convites</h1>
				<p className="text-sm text-muted-foreground">Confira aqui todos os convites a sua organização.</p>
			</header>

			{organizationSlug && (
				<section>
					<InviteLinkBox organizationId={organizationId} organizationSlug={organizationSlug} className="max-w-xl" />
				</section>
			)}

			<section className="space-y-2">
				<h2 className="text-sm font-medium text-muted-foreground">Convites da organização</h2>
				<OrganizationInvitesTable data={invites} />
			</section>
		</div>
	)
}

export default MyNetworkPage
