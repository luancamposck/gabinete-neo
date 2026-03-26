import { AlertTriangle, CalendarDays, CheckCircle, CircleAlert, DollarSign, FileText, Info, type LucideIcon, MessageSquare, Target, Users } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardFooter, CardTitle } from "@/shared/components/ui/card"

const STATS = [
	{
		id: 0,
		title: "Apoiadores Ativos",
		value: "2.847",
		change: "+15% vs. mês anterior",
		icon: Users
	},
	{
		id: 1,
		title: "Arrecadação Total",
		value: "R$ 125.000",
		change: "+23% vs. mês anterior",
		icon: DollarSign
	},
	{
		id: 2,
		title: "Eventos Realizados",
		value: "23",
		change: "+8% vs. mês anterior",
		icon: CalendarDays
	},
	{
		id: 3,
		title: "Propostas Publicadas",
		value: "15",
		change: "+12% vs. mês anterior",
		icon: FileText
	},
	{
		id: 4,
		title: "Taxa de Engajamento",
		value: "87%",
		change: "+5% vs. mês anterior",
		icon: Target
	}
]

const RECENT_ACTIVITIES = [
	{
		id: 0,
		action: "Maria Silva se cadastrou como apoiadora",
		time: "2 min atrás",
		color: "bg-green-500"
	},
	{
		id: 1,
		action: "Doação de R$ 250 recebida via PIX",
		time: "15 min atrás",
		color: "bg-yellow-500"
	},
	{
		id: 2,
		action: 'Evento "Roda de Conversa - Saúde" agendado',
		time: "1h atrás",
		color: "bg-purple-500"
	},
	{
		id: 3,
		action: "Post sobre educação teve 847 curtidas",
		time: "3h atrás",
		color: "bg-blue-500"
	}
]

type AlertItem = {
	id: number
	message: string
	level: "ALTA" | "MÉDIA" | "BAIXA"
	color: AlertColor
	icon: LucideIcon
}

const ALERTS_AND_REMINDERS: AlertItem[] = [
	{
		id: 0,
		message: "Prestação de contas mensal vence em 5 dias",
		level: "ALTA",
		color: "red",
		icon: AlertTriangle
	},
	{
		id: 1,
		message: "Meta de arrecadação mensal atingida (108%)",
		level: "BAIXA",
		color: "green",
		icon: CheckCircle
	},
	{
		id: 2,
		message: "Votação importante sobre transporte público amanhã",
		level: "MÉDIA",
		color: "yellow",
		icon: Info
	}
]

type AlertColor = "red" | "green" | "yellow"

const colorStyles = {
	red: {
		bg: "dark:bg-red-900/20 bg-red-900/80",
		border: "border-red-500",
		badge: "bg-red-500 text-white"
	},
	green: {
		bg: "dark:bg-green-900/20 bg-green-900/80",
		border: "border-green-500",
		badge: "bg-green-500 text-black"
	},
	yellow: {
		bg: "dark:bg-yellow-900/20 bg-yellow-900/80",
		border: "border-yellow-500",
		badge: "bg-yellow-500 text-black"
	}
} as const satisfies Record<AlertColor, { bg: string; border: string; badge: string }>

const HomePage = async () => {
	return (
		<div className="space-y-6">
			<section>
				<h1 className="text-3xl font-semibold mb-4 flex items-center gap-2">Dashboard da Campanha</h1>
				<p>Visão geral completa da sua campanha política</p>
			</section>

			<section className="@container">
				<div className="grid grid-cols-1 @xs:grid-cols-2 @xl:grid-cols-3 @6xl:grid-cols-5  gap-4">
					{STATS.map(({ icon: Icon, ...cardContent }) => (
						<Card key={cardContent.id} className="@max-md:gap-2 @max-md:py-2">
							<div className="px-6 flex justify-between">
								<CardTitle className="text-sm font-medium">{cardContent.title}</CardTitle>
								<Icon className="size-4 text-[#A0AEC0]" />
							</div>

							<CardContent className="text-2xl font-bold">{cardContent.value}</CardContent>

							<CardFooter className="text-emerald-500 dark:text-emerald-400">{cardContent.change}</CardFooter>
						</Card>
					))}
				</div>
			</section>

			<section className="@container">
				<div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
					<Card className="@max-md:gap-2 @max-md:py-2">
						<div className="px-6 flex items-center gap-x-3">
							<MessageSquare className="size-5" />

							<CardTitle className="text-2xl font-semibold">Atividades Recentes</CardTitle>
						</div>

						<CardContent className="text-2xl font-bold">
							<ul className="space-y-4">
								{RECENT_ACTIVITIES.map((ACTIVITY) => (
									<li key={ACTIVITY.id} className="flex items-start gap-3">
										<div className={cn("size-2 rounded-full mt-2", ACTIVITY.color)} />

										<div>
											<p className="text-sm">{ACTIVITY.action}</p>
											<p className="text-[#A0AEC0] text-xs">{ACTIVITY.time}</p>
										</div>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					<Card className="@max-md:gap-2 @max-md:py-2">
						<div className="px-6 flex items-center gap-x-3">
							<CircleAlert className="size-5" />

							<CardTitle className="text-2xl font-semibold">Alertas e Lembretes</CardTitle>
						</div>

						<CardContent className="text-2xl font-bold">
							<ul className="space-y-4">
								{ALERTS_AND_REMINDERS.map((ITEM) => {
									const color = colorStyles[ITEM.color]

									return (
										<li key={ITEM.id} className={cn("p-3 rounded-lg border-l-4", color.bg, color.border)}>
											<p className="text-[#F8FAFC] text-sm">Votação importante sobre transporte público amanhã</p>
											<Badge className={cn("mt-2 text-xs", color.badge)}>MEDIA</Badge>
										</li>
									)
								})}
							</ul>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	)
}

export default HomePage
