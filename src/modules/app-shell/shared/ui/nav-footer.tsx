"use client"

import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { signOutAction } from "@/modules/auth/server/slices/sign-out/actions/sign-out.action"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"

function getInitials(name: string) {
	if (!name) return "??"
	const names = name.split(" ")
	const firstInitial = names[0]?.[0] || ""
	const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] : ""
	return `${firstInitial}${lastInitial}`.toUpperCase()
}

type NavFooterParams = {
	user: {
		name: string
		email: string
	}
}

export const NavFooter = (params: NavFooterParams) => {
	const { user } = params

	const { isMobile } = useSidebar()
	const router = useRouter()

	async function handleSignOut() {
		const signOutRes = await signOutAction()
		if (signOutRes.success === false) {
			toast.error("Erro ao se deslogar", {
				description: "Tente novamente mais tarde, se o erro permanecer contate o suporte."
			})
			return
		}

		router.replace("/")
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
							<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">{getInitials(user.name)}</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-xs text-muted-foreground">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">{getInitials(user.name)}</div>

								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-xs text-muted-foreground">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link href="/dashboard/my-account">
									<BadgeCheck />
									Minha conta
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell />
								Notificações
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-destructive" onSelect={handleSignOut}>
							<LogOut className="text-destructive" />
							Sair
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
