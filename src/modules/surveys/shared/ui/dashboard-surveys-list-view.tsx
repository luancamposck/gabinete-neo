import { ArrowRight, CalendarClock, FilePenLine, Layers3, type LucideIcon, PlusCircle, ShieldCheck } from "lucide-react"
import Link from "next/link"
import type { SurveyDashboardListItemDTO } from "@/modules/surveys/shared/types/dto"
import { SurveyStatusBadge, SurveyVisibilityBadge } from "@/modules/surveys/shared/ui/survey-status-badge"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"

type DashboardSurveysListViewProps = {
	surveys: SurveyDashboardListItemDTO[]
	canManageSurveys: boolean
}

type DashboardSurveysListErrorStateProps = {
	title: string
	description: string
}

type SurveyVisibilityPresentation = {
	label: string
	variant: "default" | "secondary" | "outline"
}

function formatDateLabel(date: string | null) {
	if (!date) {
		return "Sem data definida"
	}

	const parsedDate = new Date(date)
	if (Number.isNaN(parsedDate.getTime())) {
		return "Data indisponível"
	}

	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(parsedDate)
}

function getDescriptionPreview(description: string | null) {
	if (!description) {
		return "Sem descrição adicional."
	}

	if (description.length <= 150) {
		return description
	}

	return `${description.slice(0, 147).trimEnd()}...`
}

function getSurveyVisibilityPresentation(visibility: SurveyDashboardListItemDTO["visibility"]): SurveyVisibilityPresentation {
	switch (visibility) {
		case "public":
			return {
				label: "Pública",
				variant: "default"
			}

		case "private":
			return {
				label: "Privada",
				variant: "outline"
			}
	}
}

type SurveyMetaCardProps = {
	icon: LucideIcon
	title: string
	description: string
}

const SurveyMetaCard = ({ icon: Icon, title, description }: SurveyMetaCardProps) => {
	return (
		<div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4">
			<Icon className="mt-0.5 size-4 shrink-0 text-foreground" />
			<div className="space-y-1">
				<p className="font-medium text-foreground">{title}</p>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
		</div>
	)
}

export const DashboardSurveysListView = ({ surveys, canManageSurveys }: DashboardSurveysListViewProps) => {
	if (surveys.length === 0) {
		return (
			<section className="space-y-6">
				<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div className="space-y-2">
						<Badge variant="outline">Pesquisas do dashboard</Badge>
						<div className="space-y-2">
							<h1 className="text-3xl font-semibold tracking-tight">Pesquisas da sua organização</h1>
							<p className="max-w-3xl text-sm text-muted-foreground">Acompanhe as pesquisas publicadas ou privadas do tenant atual sem duplicar regras de acesso na interface.</p>
						</div>
					</div>

					{canManageSurveys && (
						<Button asChild>
							<Link href="/dashboard/surveys/new">
								<PlusCircle />
								Nova pesquisa
							</Link>
						</Button>
					)}
				</header>

				<Card className="border-dashed">
					<CardHeader className="space-y-3 text-center">
						<Badge variant="outline" className="mx-auto">
							Listagem vazia
						</Badge>
						<CardTitle className="text-3xl">Nenhuma pesquisa cadastrada ainda</CardTitle>
						<CardDescription className="mx-auto max-w-2xl text-base">Quando sua organização criar pesquisas públicas ou privadas, elas aparecerão aqui para resposta ou acompanhamento.</CardDescription>
					</CardHeader>
				</Card>
			</section>
		)
	}

	return (
		<section className="space-y-6">
			<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-2">
					<Badge variant="outline">Pesquisas do dashboard</Badge>
					<div className="space-y-2">
						<h1 className="text-3xl font-semibold tracking-tight">Pesquisas da sua organização</h1>
						<p className="max-w-3xl text-sm text-muted-foreground">Veja pesquisas públicas e privadas do tenant atual, acompanhe janelas de resposta e acesse ações de gestão quando sua permissão permitir.</p>
					</div>
				</div>

				{canManageSurveys && (
					<Button asChild>
						<Link href="/dashboard/surveys/new">
							<PlusCircle />
							Nova pesquisa
						</Link>
					</Button>
				)}
			</header>

			<div className="grid gap-4 xl:grid-cols-2">
				{surveys.map((survey) => {
					const visibility = getSurveyVisibilityPresentation(survey.visibility)

					return (
						<Card key={survey.id} className="flex h-full flex-col">
							<CardHeader className="space-y-4">
								<div className="flex flex-wrap items-center gap-2">
									<SurveyStatusBadge status={survey.status} />
									<SurveyVisibilityBadge visibility={survey.visibility} />
									<Badge variant={survey.acceptAnonymousAnswers ? "secondary" : "outline"}>{survey.acceptAnonymousAnswers ? "Aceita anonimato" : "Exige identificação"}</Badge>
								</div>

								<div className="space-y-2">
									<CardTitle className="text-2xl">{survey.title}</CardTitle>
									<CardDescription className="text-base">{getDescriptionPreview(survey.description)}</CardDescription>
								</div>
							</CardHeader>

							<CardContent className="flex flex-1 flex-col gap-3">
								<div className="grid gap-3 sm:grid-cols-2">
									<SurveyMetaCard icon={CalendarClock} title="Início" description={formatDateLabel(survey.startsAt)} />
									<SurveyMetaCard icon={ShieldCheck} title="Prazo final" description={formatDateLabel(survey.endsAt)} />
								</div>

								<div className="grid gap-3 sm:grid-cols-2">
									<SurveyMetaCard
										icon={Layers3}
										title="Visibilidade"
										description={visibility.label === "Pública" ? "Disponível para visitantes e membros quando publicada." : "Disponível apenas para membros ativos da organização."}
									/>
									<SurveyMetaCard icon={FilePenLine} title="Última atualização" description={formatDateLabel(survey.updatedAt)} />
								</div>
							</CardContent>

							<CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<Button asChild className="w-full sm:w-auto">
									<Link href={`/dashboard/surveys/${survey.id}`}>
										Abrir pesquisa
										<ArrowRight />
									</Link>
								</Button>

								{canManageSurveys && (
									<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
										<Button asChild variant="outline" className="w-full sm:w-auto">
											<Link href={`/dashboard/surveys/${survey.id}/results`}>Resultados</Link>
										</Button>
										<Button asChild variant="secondary" className="w-full sm:w-auto">
											<Link href={`/dashboard/surveys/${survey.id}/edit`}>Gerenciar</Link>
										</Button>
									</div>
								)}
							</CardFooter>
						</Card>
					)
				})}
			</div>
		</section>
	)
}

export const DashboardSurveysListErrorState = ({ title, description }: DashboardSurveysListErrorStateProps) => {
	return (
		<Card className="max-w-3xl">
			<CardHeader className="space-y-3">
				<Badge variant="outline">Pesquisas do dashboard</Badge>
				<CardTitle>{title}</CardTitle>
				<CardDescription className="text-base">{description}</CardDescription>
			</CardHeader>
		</Card>
	)
}
