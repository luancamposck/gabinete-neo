import { Clock3, ShieldCheck, Sparkles, Users2 } from "lucide-react"

import { CreateOrganizationTaskForm } from "@/components/forms/organization-task/create-organization-task-form"

const highlightBadges = [
	{ icon: Users2, label: "Equipe sincronizada" },
	{ icon: ShieldCheck, label: "Contexto centralizado" },
	{ icon: Clock3, label: "Prazos no radar" }
]

const guidanceCards = [
	{
		icon: Sparkles,
		title: "Deixe claro o impacto",
		description: "Apresente o por que da tarefa e como ela movimenta a constelação."
	},
	{
		icon: ShieldCheck,
		title: "Defina próximos passos",
		description: "Inclua entregáveis e responsáveis para que ninguém fique no escuro."
	},
	{
		icon: Users2,
		title: "Compartilhe o contexto",
		description: "Links, notas e expectativas ajudam a equipe a começar com segurança."
	}
]

export const NewOrganizationTaskPage = () => {
	return (
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50 rounded-lg">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute left-[-10%] top-[-20%] h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/30" />
				<div className="absolute right-[-16%] bottom-[-12%] h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/25" />
				<div className="absolute inset-x-6 top-28 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent dark:via-white/10" />
			</div>

			<div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10">
				<div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-cyan-100">
					<Sparkles className="h-4 w-4 text-cyan-500 dark:text-cyan-100" />
					<span>Nova tarefa</span>
					<span className="hidden text-slate-600 sm:inline dark:text-white/60">Organize a constelação sem atrito</span>
				</div>

				<header className="space-y-4">
					<div className="space-y-2">
						<h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Nova tarefa</h1>
						<p className="max-w-3xl text-base text-slate-700 dark:text-white/70">Crie e acompanhe novas responsabilidades para que todos saibam o que importa agora.</p>
					</div>

					<div className="flex flex-wrap gap-3">
						{highlightBadges.map(({ icon: Icon, label }) => (
							<div key={label} className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white/80">
								<Icon className="h-4 w-4 text-cyan-500 dark:text-cyan-300" />
								<span>{label}</span>
							</div>
						))}
					</div>
				</header>

				<div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
					<div className="relative">
						<div className="absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-cyan-400/15 via-transparent to-emerald-400/15 blur-2xl dark:from-cyan-500/15 dark:to-emerald-500/15" />
						<div className="rounded-[24px] border border-slate-200/80 bg-white/90 sm:p-4 shadow-[0_24px_90px_-60px_rgba(15,23,42,0.6)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[0_24px_90px_-40px_rgba(0,0,0,0.9)]">
							<CreateOrganizationTaskForm />
						</div>
					</div>

					<aside className="space-y-4">
						<div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5">
							<div className="flex items-start gap-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/80 text-cyan-600 dark:bg-white/10 dark:text-cyan-200">
									<Clock3 className="h-6 w-6" />
								</div>
								<div className="space-y-1">
									<p className="text-sm font-semibold text-slate-900 dark:text-white">Contexto rapido</p>
									<p className="text-sm text-slate-600 dark:text-white/70">Traga o objetivo, quem precisa agir e qual o prazo desejado para evitar duvidas logo na criacao.</p>
								</div>
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
							{guidanceCards.map(({ icon: Icon, title, description }) => (
								<div key={title} className="flex items-start gap-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/80 text-cyan-600 dark:bg-white/10 dark:text-cyan-200">
										<Icon className="h-6 w-6" />
									</div>

									<div className="space-y-1">
										<p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
										<p className="text-sm text-slate-600 dark:text-white/70">{description}</p>
									</div>
								</div>
							))}
						</div>
					</aside>
				</div>
			</div>
		</div>
	)
}

export default NewOrganizationTaskPage
