// src/app/invite-pending/page.tsx
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { getPendingOrganizationInviteByUserIdRepo } from "@/repositories/organization-invites/organization-invites.repo"
import { findOrganizationMembershipByUserAdminRepo } from "@/repositories/organization-menberships/organization-menberships.admin.repo"

const InvitePendingPage = async () => {
	// 1) Descobrir usuário logado
	const supabase = await createClient()
	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user) {
		// Se não estiver logado, manda pro login
		redirect("/sign-in")
	}

	const userId = user.id

	// 2) Verificar se ele já tem membership ativa (caso admin já aprovou)
	const { data: membership, error: membershipError } = await findOrganizationMembershipByUserAdminRepo({ userId })

	if (membershipError) {
		console.error("[InvitePendingPage] erro ao buscar membership:", membershipError)
		// Aqui você pode renderizar uma página de erro genérica
		return (
			<div className="p-6">
				<h1 className="text-xl font-semibold">Algo deu errado</h1>
				<p className="mt-2 text-sm text-muted-foreground">Não foi possível verificar seu acesso à organização. Tente novamente em alguns instantes.</p>
			</div>
		)
	}

	if (membership) {
		// Já aprovado → manda pro dashboard
		redirect("/dashboard")
	}

	// 3) Não tem membership ativa, verificar se tem convite pendente
	const { data: pendingInvite, error: pendingInviteError } = await getPendingOrganizationInviteByUserIdRepo({ userId })

	if (pendingInviteError) {
		console.error("[InvitePendingPage] erro ao buscar invite pendente:", pendingInviteError)

		return (
			<div className="p-6">
				<h1 className="text-xl font-semibold">Algo deu errado</h1>
				<p className="mt-2 text-sm text-muted-foreground">Não foi possível verificar seu convite. Tente novamente em alguns instantes.</p>
			</div>
		)
	}

	if (!pendingInvite) {
		// Não tem membership nem invite pendente → não faz sentido estar aqui
		redirect("/no-organization")
	}

	// 4) Buscar dados da organização + quem convidou (created_by_user_id)
	const supabaseAdmin = createAdminClient()

	// Organização
	const { data: organization, error: organizationError } = await supabaseAdmin.from("organizations").select("id, name, slug").eq("id", pendingInvite.organization_id).maybeSingle()

	if (organizationError) {
		console.error("[InvitePendingPage] erro ao buscar organização:", organizationError)
	}

	// Usuário que criou o invite (dono do link)
	const { data: inviterUser, error: inviterError } = await supabaseAdmin.from("users").select("id, name, email").eq("id", pendingInvite.created_by_user_id).maybeSingle()

	if (inviterError) {
		console.error("[InvitePendingPage] erro ao buscar usuário convidador:", inviterError)
	}

	const organizationName = organization?.name ?? "sua organização"
	const inviterName = inviterUser?.name ?? "Um membro da organização"

	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4">
			<div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-sm">
				<h1 className="text-2xl font-semibold tracking-tight">Seu acesso está aguardando aprovação</h1>

				<p className="mt-3 text-sm text-muted-foreground">
					Você solicitou acesso à organização <span className="font-medium text-foreground">{organizationName}</span>.
				</p>

				<p className="mt-2 text-sm text-muted-foreground">
					O convite foi criado por <span className="font-medium text-foreground">{inviterName}</span>. Um administrador ou proprietário da organização precisa aprovar seu acesso.
				</p>

				<div className="mt-6 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
					<p>Assim que seu convite for aprovado, você será redirecionado automaticamente para o painel da organização ao entrar no sistema.</p>
				</div>

				<div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
					<span>ID do convite: {pendingInvite.id}</span>
					{organization?.slug && <span>Organização: /{organization.slug}</span>}
				</div>
			</div>
		</div>
	)
}

export default InvitePendingPage
