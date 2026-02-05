import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import { ModeToggleButton } from "@/components/mode-toggle-button"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Vortex } from "@/components/vortex"
import { AppSidebar } from "@/modules/app-shell/ui/app-sidebar"
import { requireDashboardAccessAction } from "@/modules/auth/server/slices/dashboard-guard/actions/require-dashboard-acess.action"

const DashboardLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
	const isDevEnviroment = process.env.NODE_ENV === "development"

	const cookieStore = await cookies()
	const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
	const requestHeaders = await headers()
	const rawUri = requestHeaders.get("x-forwarded-uri") ?? requestHeaders.get("x-url") ?? requestHeaders.get("referer")
	let hasAutotry = false

	if (rawUri) {
		try {
			const url = rawUri.startsWith("http") ? new URL(rawUri) : new URL(rawUri, "http://local")
			hasAutotry = url.searchParams.get("autotry") === "1"
		} catch (err) {
			console.error("[DashboardLayout] Failed to parse request URL for autotry:", err)
			hasAutotry = false
		}
	}

	const res = await requireDashboardAccessAction()

	if (res.success === false) {
		switch (res.code) {
			case "unauthenticated": {
				return redirect("/") // ou "/auth"
			}

			case "org_not_found": {
				const searchParams = new URLSearchParams({ from: "guard" })
				if (hasAutotry) {
					searchParams.set("autotry", "1")
				}
				return redirect(`/tenant-not-found?${searchParams.toString()}`)
			}

			case "not_member": {
				// página de “você está logado, mas não pertence a essa org”
				return redirect("/join")
			}

			default: {
				// deixa o error boundary do /dashboard lidar
				throw new Error(res.message)
			}
		}
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
