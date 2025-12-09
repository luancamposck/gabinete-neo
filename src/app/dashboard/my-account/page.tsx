import { Building2, CalendarClock, Hash, Mail, MapPin, Phone, User2 } from "lucide-react"
import { redirect } from "next/navigation"
import { getCurrentAuthUserAction } from "@/actions/auth/get-current-auth-user.action"
import { findOrganizationMembershipWithOrganizationByUserIdAction } from "@/actions/organization"
import { getUserWithProfileByUserIdAction } from "@/actions/public-users"
import cn from "@/lib/utils/cn"
import { formatCep, formatPhone } from "@/lib/utils/formatters"
import type { EditUserWithProfileBaseSchemaClientData } from "@/lib/validations/use-cases/edit-user-with-profile-schemas/edit-user-with-profile-schemas.client"
import { EditMyAccountDialog } from "./sub-components/edit-my-account-dialog"

const MyAccountPage = async () => {
	// 1) Pegar o ID do usuário logado
	const getCurrentAuthUserActionRes = await getCurrentAuthUserAction()
	if (getCurrentAuthUserActionRes.success === false) {
		redirect("/")
	}

	const userId = getCurrentAuthUserActionRes.data.user.id

	// 2) Pegar dados do usuário em public.users e user_profiles
	const getUserWithProfileByUserIdActionRes = await getUserWithProfileByUserIdAction({ userId })
	if (!getUserWithProfileByUserIdActionRes.success || !getUserWithProfileByUserIdActionRes.data.user.profile) {
		redirect("/")
	}

	const userWithProfile = getUserWithProfileByUserIdActionRes.data.user

	// 3) Pegar dados da organization que o usuário participa
	const findOrganizationMembershipWithOrganizationByUserIdActionRes = await findOrganizationMembershipWithOrganizationByUserIdAction({ userId })
	if (findOrganizationMembershipWithOrganizationByUserIdActionRes.success === false) {
		return (
			<div>
				<h1>Algo deu errado ao carregar os dados da sua constelação. Por favor, tente novamente mais tarde.</h1>
			</div>
		)
	}

	const membership = findOrganizationMembershipWithOrganizationByUserIdActionRes.data?.membership ?? null

	const defaultValuesForm: EditUserWithProfileBaseSchemaClientData = {
		name: userWithProfile.name,
		phone: userWithProfile.profile.phone,
		adress: {
			cep: userWithProfile.profile.cep,
			street: userWithProfile.profile.street,
			number: userWithProfile.profile.number,
			neighborhood: userWithProfile.profile.neighborhood,
			city: userWithProfile.profile.city,
			state: userWithProfile.profile.state,
			complement: userWithProfile.profile.complement
		}
	}

	return (
		<div className="p-4 space-y-6">
			<header className="flex flex-col md:flex-row gap-3 items-center md:justify-between">
				<div className="space-y-1 flex-col">
					<h1 className="text-2xl font-semibold tracking-tight">Minha conta</h1>
					<p className="text-sm text-muted-foreground">Todos os dados da sua conta reunidos em um só lugar.</p>
				</div>

				<EditMyAccountDialog userId={userId} defaultValues={defaultValuesForm} />
			</header>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
				{/* Coluna esquerda – dados pessoais + constelação */}
				<section className="space-y-4">
					{/* Card: dados pessoais */}
					<div className="rounded-lg border bg-card p-4 shadow-sm">
						<div className="flex flex-col md:flex-row max-md:justify-center items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
								<User2 className="h-6 w-6 text-primary" />
							</div>

							<div className="space-y-1">
								<div className="flex flex-col md:flex-row max-md:items-center gap-2">
									<span className="text-base font-semibold leading-tight">{userWithProfile.name ?? "Nome não cadastrado"}</span>
									{userWithProfile.created_at && (
										<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
											Usuário desde{" "}
											{new Date(userWithProfile.created_at).toLocaleDateString("pt-BR", {
												day: "2-digit",
												month: "2-digit",
												year: "numeric"
											})}
										</span>
									)}
								</div>
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<Mail className="h-3.5 w-3.5" />
									<span>{userWithProfile.email}</span>
								</div>
							</div>
						</div>

						<div className="mt-4 grid gap-4 border-t pt-4 text-sm sm:grid-cols-2">
							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Telefone</div>
								<div className="inline-flex items-center gap-2 rounded-md bg-muted/60 px-2 py-1.5">
									<Phone className="h-3.5 w-3.5 text-muted-foreground" />
									<span className="text-xs text-muted-foreground">{formatPhone(userWithProfile.profile.phone)}</span>
								</div>
							</div>

							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">ID do usuário</div>
								<div className="rounded-md bg-muted/60 p-2">
									<p className="break-all font-mono text-[11px] text-muted-foreground">{userWithProfile.id}</p>
								</div>
							</div>

							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Conta criada em</div>
								<div className="inline-flex items-center gap-2 rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">
									<CalendarClock className="h-3.5 w-3.5" />
									<span>
										{userWithProfile.created_at
											? new Date(userWithProfile.created_at).toLocaleString("pt-BR", {
													day: "2-digit",
													month: "2-digit",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit"
												})
											: "Data não disponível"}
									</span>
								</div>
							</div>

							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Perfil cadastrado em</div>
								<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">
									{userWithProfile.created_at
										? new Date(userWithProfile.created_at).toLocaleString("pt-BR", {
												day: "2-digit",
												month: "2-digit",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit"
											})
										: "Data não disponível"}
								</div>
							</div>
						</div>
					</div>

					{/* Card: constelação / organização atual */}
					<div className="rounded-lg border bg-card p-4 shadow-sm">
						<div className="flex flex-col md:flex-row justify-center items-center md:justify-between gap-2">
							<div className="flex flex-col md:flex-row items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
									<Building2 className="h-4 w-4 text-primary" />
								</div>

								<div>
									<div className="text-sm font-semibold">Constelação</div>
									<div className="text-xs text-muted-foreground">Informações sobre a organização da qual você faz parte.</div>
								</div>
							</div>

							{membership?.role && (
								<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{membership.role === "OWNER" ? "Owner" : membership.role === "ADMIN" ? "Admin" : "Membro"}</span>
							)}
						</div>

						{membership?.organization ? (
							<div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Nome da constelação</div>
									<div className="text-sm font-medium">{membership.organization.name}</div>
									{membership.organization.slug && (
										<div className="mt-1 inline-flex items-center gap-2 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
											<Hash className="h-3 w-3" />
											<span>{membership.organization.slug}</span>
										</div>
									)}
								</div>

								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Participa desde</div>
									<div className="inline-flex items-center gap-2 rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">
										<CalendarClock className="h-3.5 w-3.5" />
										<span>
											{membership.created_at
												? new Date(membership.created_at).toLocaleString("pt-BR", {
														day: "2-digit",
														month: "2-digit",
														year: "numeric",
														hour: "2-digit",
														minute: "2-digit"
													})
												: "Data não disponível"}
										</span>
									</div>
								</div>

								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Status na constelação</div>
									<div className="inline-flex items-center gap-2 rounded-md bg-muted/60 px-2 py-1.5 text-xs">
										<span className={cn("h-2.5 w-2.5 rounded-full", membership.is_active ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600")} />
										<span className="text-muted-foreground">{membership.is_active ? "Ativo" : "Inativo"}</span>
									</div>
								</div>
							</div>
						) : (
							<div className="mt-4 rounded-md border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">Você ainda não faz parte de nenhuma constelação ativa no momento.</div>
						)}
					</div>
				</section>

				{/* Coluna direita – endereço */}
				<section className="space-y-4">
					<div className="rounded-lg border bg-card p-4 shadow-sm">
						<div className="flex flex-col md:flex-row justify-center items-center md:justify-between gap-2">
							<div className="flex flex-col md:flex-row items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
									<MapPin className="h-4 w-4 text-primary" />
								</div>
								<div>
									<div className="text-sm font-semibold">Endereço</div>
									<div className="text-xs text-muted-foreground">Informações de localização cadastradas no seu perfil.</div>
								</div>
							</div>
							{userWithProfile.profile?.city && userWithProfile.profile?.state && (
								<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
									{userWithProfile.profile.city} / {userWithProfile.profile.state}
								</span>
							)}
						</div>

						<div className="mt-4 grid gap-3 text-sm">
							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">CEP</div>
								<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{formatCep(userWithProfile.profile.cep)}</div>
							</div>

							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Rua e número</div>
								<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">
									{userWithProfile.profile?.street ? `${userWithProfile.profile.street}${userWithProfile.profile.number ? `, ${userWithProfile.profile.number}` : ""}` : "Não informado"}
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Bairro</div>
									<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{userWithProfile.profile?.neighborhood ?? "Não informado"}</div>
								</div>

								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Complemento</div>
									<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{userWithProfile.profile?.complement?.trim() ? userWithProfile.profile.complement : "Não informado"}</div>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Cidade</div>
									<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{userWithProfile.profile?.city ?? "Não informado"}</div>
								</div>

								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Estado</div>
									<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{userWithProfile.profile?.state ?? "Não informado"}</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}

export default MyAccountPage
