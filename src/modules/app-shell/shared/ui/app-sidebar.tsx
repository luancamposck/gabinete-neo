import { ChevronRight, Settings } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem
} from "@/components/ui/sidebar"
import { getSidebarContextAction } from "@/modules/app-shell/server/slices/get-sidebar-context/actions/get-sidebar-context.action"
import { navMain } from "@/modules/app-shell/shared/navigation/nav-main"
import { NavFooter } from "@/modules/app-shell/shared/ui/nav-footer"

const AppSidebar = async () => {
	const sidebarContextRes = await getSidebarContextAction()

	if (sidebarContextRes.success === false) {
		switch (sidebarContextRes.code) {
			case "unauthenticated": {
				return redirect("/")
			}

			case "org_not_found": {
				return redirect("/tenant-not-found")
			}

			default: {
				// deixa o error boundary do /dashboard lidar
				throw new Error(sidebarContextRes.message)
			}
		}
	}

	const { user, permissionKeys } = sidebarContextRes.data

	const canViewAdminConfigs = permissionKeys.includes("org.admin.read")
	const canViewUsersConfigs = permissionKeys.includes("users.read")
	const canViewRolesConfigs = permissionKeys.includes("roles.read")

	const showConfigCollapsible = canViewAdminConfigs || canViewUsersConfigs || canViewRolesConfigs

	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader>
				<Image alt="Gabinete NEO" src="/logo.png" width={150} height={150} className="mx-auto p-2" />
				<h1 className="font-semibold text-center text-3xl group-data-[collapsible=icon]:hidden">Gabinete NEO</h1>
			</SidebarHeader>

			<Separator className="data-[orientation=horizontal]:h-0.5" />

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Constelação X</SidebarGroupLabel>
					<SidebarMenu>
						{navMain.map((item) => (
							<Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton tooltip={item.title}>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map((subItem) => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton asChild>
														<Link href={subItem.url}>
															<span>{subItem.title}</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						))}
						{showConfigCollapsible && (
							<Collapsible asChild defaultOpen={false} className="group/collapsible">
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton tooltip={"Configurações"}>
											<Settings />
											<span>Configurações</span>
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										{canViewAdminConfigs && (
											<SidebarMenuSub>
												<SidebarMenuSubItem>
													<SidebarMenuSubButton asChild>
														<Link href="/dashboard/config/organization">
															<span>Gabinete</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											</SidebarMenuSub>
										)}

										{canViewUsersConfigs && (
											<SidebarMenuSub>
												<SidebarMenuSubItem>
													<SidebarMenuSubButton asChild>
														<Link href="/dashboard/config/users">
															<span>Usuários</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											</SidebarMenuSub>
										)}

										{canViewRolesConfigs && (
											<SidebarMenuSub>
												<SidebarMenuSubItem>
													<SidebarMenuSubButton asChild>
														<Link href="/dashboard/config/roles">
															<span>Cargos e Permissões</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											</SidebarMenuSub>
										)}
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						)}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<NavFooter
					user={{
						email: user.email,
						name: user.name
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	)
}

export { AppSidebar }
