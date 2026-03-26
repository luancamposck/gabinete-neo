import { redirect } from "next/navigation"
import { getOrganizationReferralsForTableAction } from "@/modules/organizations/referrals/server/slices/get-organization-referrals-for-table/actions/get-organization-referrals-for-table.action"
import { MyReferralLinkButton } from "@/modules/organizations/referrals/shared/ui/my-referral-link-button"
import { OrganizationReferralsTable } from "@/modules/organizations/referrals/shared/ui/organization-referrals-table"

const MyInvitesPage = async () => {
	const referralsRes = await getOrganizationReferralsForTableAction()

	if (referralsRes.success === false) {
		switch (referralsRes.code) {
			case "unauthenticated": {
				return redirect("/")
			}

			case "org_not_found": {
				return redirect("/tenant-not-found")
			}

			case "not_member": {
				return redirect("/no-organization")
			}

			default: {
				throw new Error(referralsRes.message)
			}
		}
	}

	const { referrals } = referralsRes.data

	return (
		<div className="p-4 space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Minhas indicações</h1>
				<p className="text-sm text-muted-foreground">Confira aqui todas as indicações da sua constelação.</p>
			</header>

			<MyReferralLinkButton className="max-w-xl" />

			<section className="space-y-2">
				<h2 className="text-sm font-medium text-muted-foreground">Indicações da constelação</h2>

				{referrals.length > 0 ? (
					<OrganizationReferralsTable data={referrals} />
				) : (
					<div className="rounded-md border bg-card p-4">
						<p className="text-sm text-muted-foreground">Ainda não há indicações registradas para a constelação.</p>
					</div>
				)}
			</section>
		</div>
	)
}

export default MyInvitesPage
