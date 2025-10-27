import {
  BarChart3,
  Briefcase,
  CalendarDays,
  CreditCard,
  Database,
  FileText,
  Globe,
  HandCoins,
  Home,
  LayoutDashboard,
  LineChart,
  Mail,
  Megaphone,
  PenTool,
  Scale,
  Search,
  Settings,
  Smartphone,
  Store,
  TerminalSquare,
  Truck,
  UserCheck,
  UserCog,
  Users
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Home",
    url: "/dashboard/home",
    icon: Home
  },
  {
    title: "Painel Administrativo",
    url: "#",
    icon: LayoutDashboard
  },
  {
    title: "Dashboard do Candidato",
    url: "#",
    icon: UserCheck
  },
  {
    title: "Gerenciador de Conteúdo",
    url: "#",
    icon: FileText
  },
  {
    title: "Centro de Ativistas",
    url: "#",
    icon: Users
  },
  {
    title: "Command Center",
    url: "#",
    icon: TerminalSquare
  },
  {
    title: "Painel de Votações",
    url: "#",
    icon: BarChart3
  },
  {
    title: "Neo Monitor",
    url: "#",
    icon: LineChart
  },
  {
    title: "Analytics Neo PRO",
    url: "#",
    icon: Database
  },
  {
    title: "CRM Eleitoral",
    url: "#",
    icon: Briefcase
  },
  {
    title: "Neo Legal",
    url: "#",
    icon: Scale
  },
  {
    title: "Copywriter Político",
    url: "#",
    icon: PenTool
  },
  {
    title: "Assessor Neo",
    url: "#",
    icon: UserCog
  },
  {
    title: "Agenda Neo",
    url: "#",
    icon: CalendarDays
  },
  {
    title: "Mala Direta",
    url: "/dashboard/mailing-list",
    icon: Briefcase
  },
  {
    title: "Pesquisas Neo",
    url: "#",
    icon: Search
  },
  {
    title: "Doações e Finanças",
    url: "#",
    icon: HandCoins
  },
  {
    title: "Comunicação",
    url: "#",
    icon: Megaphone
  },
  {
    title: "Marketplace",
    url: "#",
    icon: Store
  },
  {
    title: "App Mobile",
    url: "#",
    icon: Smartphone
  },
  {
    title: "Área do Cidadão",
    url: "#",
    icon: Globe
  },
  {
    title: "Correios Neo",
    url: "#",
    icon: Mail
  },
  {
    title: "Frota Neo",
    url: "#",
    icon: Truck
  },
  {
    title: "PagNeo",
    url: "#",
    icon: CreditCard
  },
  {
    title: "Configurações",
    url: "#",
    icon: Settings
  }
]

const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <Image
          alt="Gabinete NEO"
          src="/logo.png"
          width={150}
          height={150}
          className="mx-auto p-2"
        />
        <h1 className="font-semibold text-center text-3xl group-data-[collapsible=icon]:hidden">
          Gabinete NEO
        </h1>
      </SidebarHeader>

      <Separator className="data-[orientation=horizontal]:h-0.5" />

      <SidebarContent>
        <SidebarMenu>
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
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export { AppSidebar }
