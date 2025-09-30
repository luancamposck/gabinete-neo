import { Briefcase, Home } from "lucide-react"
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
    title: "Mala Direta",
    url: "/dashboard/mailing-list",
    icon: Briefcase
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
