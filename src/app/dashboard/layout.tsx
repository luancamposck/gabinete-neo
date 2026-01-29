import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getCurrentAuthUserAction } from "@/actions/auth/get-current-auth-user.action"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggleButton } from "@/components/mode-toggle-button"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Vortex } from "@/components/vortex"
import { getPendingOrganizationInvitesByUserIdAdminRepo } from "@/repositories/organization-invites/organization-invites.admin.repo"
import { findOrganizationMembershipByUserIdAdminRepo } from "@/repositories/organization-menberships/organization-menberships.admin.repo"

const DashboardLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
	const isDevEnviroment = process.env.NODE_ENV === "development"

	const cookieStore = await cookies()
	const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

	const getCurrentAuthUserActionRes = await getCurrentAuthUserAction()

	// Redireciona se não houver usuário logado
	if (getCurrentAuthUserActionRes.success === false) {
		redirect("/") // ou sua página de login
	}

	const userId = getCurrentAuthUserActionRes.data.user.id

	const { data: hasMembership, error: membershipError } = await findOrganizationMembershipByUserIdAdminRepo({ userId })

	if (membershipError) {
		console.error(membershipError)
		redirect("/")
	}

	if (!hasMembership) {
		const { data: hasPendingInvites, error: pendingInvitesError } = await getPendingOrganizationInvitesByUserIdAdminRepo({ userId })
		if (pendingInvitesError) {
			console.error(pendingInvitesError)
			redirect("/")
		}

		if (hasPendingInvites) {
			redirect("/invite-pending")
		}

		redirect("/no-organization")
	}

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />

			<SidebarInset className="relative overflow-auto">
				{isDevEnviroment && (
					<div className="pointer-events-none absolute inset-0 overflow-hidden md:rounded-xl">
						<Vortex backgroundColor="transparent" className="flex size-full" rangeY={300} baseRadius={2} particleCount={50} rangeSpeed={1.5} baseHue={200} />
					</div>
				)}

				<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) py-2">
					<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

						<div className="ml-auto flex items-center gap-2">
							<span className="hidden sm:flex font-semibold">Gabinete NEO</span>
							<Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
							<ModeToggleButton />
						</div>
					</div>
				</header>

				<div className="p-4 relative">
					<div className="container mx-auto flex flex-1 flex-col justify-center gap-8">{children}</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}

export default DashboardLayout
