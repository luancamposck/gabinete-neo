import { BookOpen, Bot, ChevronRight, Settings2, Users } from "lucide-react"
import Image from "next/image"

import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

// const items = [
// 	{
// 		title: "Home",
// 		url: "/dashboard/home",
// 		icon: Home
// 	},
// 	{
// 		title: "Painel Administrativo",
// 		url: "#",
// 		icon: LayoutDashboard
// 	},
// 	{
// 		title: "Dashboard do Candidato",
// 		url: "#",
// 		icon: UserCheck
// 	},
// 	{
// 		title: "Gerenciador de Conteúdo",
// 		url: "#",
// 		icon: FileText
// 	},
// 	{
// 		title: "Centro de Ativistas",
// 		url: "#",
// 		icon: Users
// 	},
// 	{
// 		title: "Command Center",
// 		url: "#",
// 		icon: TerminalSquare
// 	},
// 	{
// 		title: "Painel de Votações",
// 		url: "#",
// 		icon: BarChart3
// 	},
// 	{
// 		title: "Neo Monitor",
// 		url: "#",
// 		icon: LineChart
// 	},
// 	{
// 		title: "Analytics Neo PRO",
// 		url: "#",
// 		icon: Database
// 	},
// 	{
// 		title: "CRM Eleitoral",
// 		url: "#",
// 		icon: Briefcase
// 	},
// 	{
// 		title: "Neo Legal",
// 		url: "#",
// 		icon: Scale
// 	},
// 	{
// 		title: "Copywriter Político",
// 		url: "#",
// 		icon: PenTool
// 	},
// 	{
// 		title: "Assessor Neo",
// 		url: "#",
// 		icon: UserCog
// 	},
// 	{
// 		title: "Agenda Neo",
// 		url: "#",
// 		icon: CalendarDays
// 	},
// 	{
// 		title: "Mala Direta",
// 		url: "/dashboard/mailing-list",
// 		icon: Briefcase
// 	},
// 	{
// 		title: "Pesquisas Neo",
// 		url: "#",
// 		icon: Search
// 	},
// 	{
// 		title: "Doações e Finanças",
// 		url: "#",
// 		icon: HandCoins
// 	},
// 	{
// 		title: "Comunicação",
// 		url: "#",
// 		icon: Megaphone
// 	},
// 	{
// 		title: "Marketplace",
// 		url: "#",
// 		icon: Store
// 	},
// 	{
// 		title: "App Mobile",
// 		url: "#",
// 		icon: Smartphone
// 	},
// 	{
// 		title: "Área do Cidadão",
// 		url: "#",
// 		icon: Globe
// 	},
// 	{
// 		title: "Correios Neo",
// 		url: "#",
// 		icon: Mail
// 	},
// 	{
// 		title: "Frota Neo",
// 		url: "#",
// 		icon: Truck
// 	},
// 	{
// 		title: "PagNeo",
// 		url: "#",
// 		icon: CreditCard
// 	},
// 	{
// 		title: "Configurações",
// 		url: "#",
// 		icon: Settings
// 	}
// ]

const navMain = [
	{
		title: "Rede de Contatos",
		url: "#",
		icon: Users,
		isActive: true,
		items: [
			{
				title: "Meus convites",
				url: "/dashboard/network/my-network"
			},
			{
				title: "Starred",
				url: "#"
			},
			{
				title: "Settings",
				url: "#"
			}
		]
	},
	{
		title: "Models",
		url: "#",
		icon: Bot,
		items: [
			{
				title: "Genesis",
				url: "#"
			},
			{
				title: "Explorer",
				url: "#"
			},
			{
				title: "Quantum",
				url: "#"
			}
		]
	},
	{
		title: "Documentation",
		url: "#",
		icon: BookOpen,
		items: [
			{
				title: "Introduction",
				url: "#"
			},
			{
				title: "Get Started",
				url: "#"
			},
			{
				title: "Tutorials",
				url: "#"
			},
			{
				title: "Changelog",
				url: "#"
			}
		]
	},
	{
		title: "Settings",
		url: "#",
		icon: Settings2,
		items: [
			{
				title: "General",
				url: "#"
			},
			{
				title: "Team",
				url: "#"
			},
			{
				title: "Billing",
				url: "#"
			},
			{
				title: "Limits",
				url: "#"
			}
		]
	}
]

const AppSidebar = () => {
	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader>
				<Image alt="Gabinete NEO" src="/logo.png" width={150} height={150} className="mx-auto p-2" />
				<h1 className="font-semibold text-center text-3xl group-data-[collapsible=icon]:hidden">Gabinete NEO</h1>
			</SidebarHeader>

			<Separator className="data-[orientation=horizontal]:h-0.5" />

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Gabinete X</SidebarGroupLabel>
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
														<a href={subItem.url}>
															<span>{subItem.title}</span>
														</a>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						))}
					</SidebarMenu>
				</SidebarGroup>

				{/* <SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild>
								<Link href={item.url} className="mx-auto">
									<item.icon />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu> */}
			</SidebarContent>
		</Sidebar>
	)
}

export { AppSidebar }
