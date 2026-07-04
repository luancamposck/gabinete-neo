import { Building2, CalendarClock, Globe2, Lock, Mail, MapPin, Phone, User2 } from "lucide-react"
import { redirect } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import { getMyAccountDataAction } from "@/modules/accounts/server/slices/my-account/actions/get-my-account-data.action"
import { EditAddressForm } from "@/modules/accounts/users/shared/ui/edit-address-form"
import { EditPasswordForm } from "@/modules/accounts/users/shared/ui/edit-password-form"
import { EditUsernameForm } from "@/modules/accounts/users/shared/ui/edit-username-form"
import { formatCep } from "@/shared/formatters/format-cep"
import { formatPhone } from "@/shared/formatters/format-phone"

const MyAccountPage = async () => {
	const getAccountRes = await getMyAccountDataAction()

	if (getAccountRes.success === false) {
		switch (getAccountRes.code) {
			case "user_not_found":
			case "unauthenticated": {
				return redirect("/")
			}

			case "org_not_found": {
				return redirect(`/tenant-not-found`)
			}

			default: {
				throw new Error(getAccountRes.message)
			}
		}
	}

	const { user, organization } = getAccountRes.data

	return (
		<div className="p-4 space-y-6">
			<header className="flex flex-col md:flex-row gap-3 items-center md:justify-between">
				<div className="space-y-1 flex-col">
					<h1 className="text-2xl font-semibold tracking-tight">Minha conta</h1>
					<p className="text-sm text-muted-foreground">Todos os dados da sua conta reunidos em um só lugar.</p>
				</div>
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
									<span className="text-base font-semibold leading-tight">{user.name}</span>
									{user.createdAt && (
										<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
											Usuário desde{" "}
											{new Date(user.createdAt).toLocaleDateString("pt-BR", {
												day: "2-digit",
												month: "2-digit",
												year: "numeric"
											})}
										</span>
									)}
								</div>
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<Mail className="h-3.5 w-3.5" />
									<span>{user.email}</span>
								</div>
							</div>
						</div>

						<div className="mt-4 grid gap-4 border-t pt-4 text-sm sm:grid-cols-2">
							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Telefone</div>
								<div className="inline-flex items-center gap-2 rounded-md bg-muted/60 px-2 py-1.5">
									<Phone className="h-3.5 w-3.5 text-muted-foreground" />
									<span className="text-xs text-muted-foreground">{formatPhone(user.phone)}</span>
								</div>
							</div>

							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">ID do usuário</div>
								<div className="rounded-md bg-muted/60 p-2">
									<p className="break-all font-mono text-[11px] text-muted-foreground">{user.id}</p>
								</div>
							</div>

							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Conta criada em</div>
								<div className="inline-flex items-center gap-2 rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">
									<CalendarClock className="h-3.5 w-3.5" />
									<span>
										{user.createdAt
											? new Date(user.createdAt).toLocaleString("pt-BR", {
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
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Username</div>
								<EditUsernameForm defaultValue={user.username} />
								{/* <div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{user.username}</div> */}
							</div>
						</div>
					</div>

					<div className="rounded-lg border bg-card p-4 shadow-sm">
						<div className="flex flex-col md:flex-row justify-center items-center md:justify-between gap-2">
							<div className="flex flex-col md:flex-row items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
									<Lock className="h-4 w-4 text-primary" />
								</div>
								<div>
									<div className="text-sm font-semibold">Mudar senha</div>
									<div className="text-xs text-muted-foreground">Mude sua senha apenas se tiver certeza de lembrar posteriormente.</div>
								</div>
							</div>
						</div>

						<div className="mt-4">
							<EditPasswordForm />
						</div>
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
							<div className="flex flex-row-reverse md:flex-row flex-wrap items-center justify-center gap-2 md:justify-end">
								<EditAddressForm
									defaultValues={{
										cep: user.address.cep,
										street: user.address.street,
										number: user.address.number,
										neighborhood: user.address.neighborhood,
										city: user.address.city,
										state: user.address.state,
										complement: user.address.complement ?? ""
									}}
								/>
								<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
									{user.address.city} / {user.address.state}
								</span>
							</div>
						</div>

						<div className="mt-4 grid gap-3 text-sm">
							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">CEP</div>
								<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{formatCep(user.address.cep)}</div>
							</div>

							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Rua e número</div>
								<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{`${user.address.street}, ${user.address.number}`}</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Bairro</div>
									<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{user.address.neighborhood}</div>
								</div>

								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Complemento</div>
									<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{user.address.complement?.trim() ? user.address.complement : "Não informado"}</div>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Cidade</div>
									<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{user.address.city}</div>
								</div>

								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Estado</div>
									<div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{user.address.state}</div>
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

							<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
								{organization.membership.role === "OWNER" ? "Owner" : organization.membership.role === "ADMIN" ? "Admin" : "Membro"}
							</span>
						</div>

						<div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Nome da constelação</div>
								<div className="text-sm font-medium">{organization.name}</div>
								<div className="mt-1 inline-flex items-center gap-2 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
									<Globe2 className="h-3 w-3" />
									<span>{organization.appDomain}</span>
								</div>
							</div>

							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Participa desde</div>
								<div className="inline-flex items-center gap-2 rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">
									<CalendarClock className="h-3.5 w-3.5" />
									<span>
										{organization.membership.createdAt
											? new Date(organization.membership.createdAt).toLocaleString("pt-BR", {
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
									<span className={cn("h-2.5 w-2.5 rounded-full", organization.membership.isActive ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600")} />
									<span className="text-muted-foreground">{organization.membership.isActive ? "Ativo" : "Inativo"}</span>
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
