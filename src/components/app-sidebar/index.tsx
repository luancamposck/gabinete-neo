import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import Image from "next/image"
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
    url: "#",
    icon: Home
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar
  },
  {
    title: "Search",
    url: "#",
    icon: Search
  },
  {
    title: "Settings",
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
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export { AppSidebar }
