import { ClipboardList, ListTodo, Users } from "lucide-react"

export const navMain = [
	{
		title: "Rede de Contatos",
		url: "#",
		icon: Users,
		isActive: true,
		items: [
			{
				title: "Convites da constelação",
				url: "/dashboard/network/my-invites"
			},
			{
				title: "Minha constelação",
				url: "/dashboard/network/my-network"
			},
			{
				title: "Mapa Espacial",
				url: "/dashboard/network/map"
			}
		]
	},
	{
		title: "Tarefas",
		url: "#",
		icon: ListTodo,
		items: [
			{
				title: "Nova Tarefa",
				url: "/dashboard/task/new"
			},
			{
				title: "Todas as Tarefas",
				url: "/dashboard/task/all"
			}
		]
	},
	{
		title: "Pesquisas",
		url: "#",
		icon: ClipboardList,
		items: [
			{
				title: "Todas as pesquisas",
				url: "/dashboard/surveys"
			}
		]
	}
]
