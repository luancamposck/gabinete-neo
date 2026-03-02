"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils/cn"
import type { PermissionKey } from "@/modules/auth/shared/permissions"
import type { OrganizationRoleOption } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import type { OrganizationUserTableRow } from "@/modules/organizations/memberships/shared/types/organization-users-table.types"
import { canShowUserRoleAction, UserRoleActionButton } from "@/modules/organizations/memberships/ui/users/actions/user-role-action-button"
import { canShowUserStatusAction, UserStatusActionButton } from "@/modules/organizations/memberships/ui/users/actions/user-status-action-button"
import { RELATIONSHIP_OPTIONS } from "@/shared/constants/relationship-options"
import { formatPhone } from "@/shared/formatters/format-phone"

type UsersCardsProps = {
	users: OrganizationUserTableRow[]
	permissionKeys: PermissionKey[]
	availableRoles: OrganizationRoleOption[]
}

const roleLabelMap: Record<string, string> = {
	OWNER: "Owner",
	ADMIN: "Admin",
	STAFF: "Equipe",
	MEMBER: "Membro"
}

const relationshipLabelMap: Record<string, string> = RELATIONSHIP_OPTIONS.reduce(
	(accumulator, option) => {
		accumulator[option.value] = option.label
		return accumulator
	},
	{} as Record<string, string>
)

const formatDate = (value: string | null | undefined) => {
	if (!value) return "-"
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return "-"

	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}).format(date)
}

export const UsersCards = ({ users, permissionKeys, availableRoles }: UsersCardsProps) => {
	if (users.length === 0) {
		return <div className="rounded-md border bg-card p-10 text-center text-sm text-muted-foreground">Nenhum resultado.</div>
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{users.map((userRow) => {
				const roleName = roleLabelMap[userRow.role.name.toUpperCase()] ?? userRow.role.name
				const relationshipLabel = userRow.relationshipToInviter ? (relationshipLabelMap[userRow.relationshipToInviter] ?? userRow.relationshipToInviter) : "-"
				const locationLabel =
					userRow.user.address.city || userRow.user.address.state ? `${userRow.user.address.city ?? ""}${userRow.user.address.city && userRow.user.address.state ? " / " : ""}${userRow.user.address.state ?? ""}` : "-"
				const canShowStatusAction = canShowUserStatusAction({
					permissionKeys,
					roleName: userRow.role.name
				})
				const canShowRoleAction = canShowUserRoleAction({
					permissionKeys,
					roleName: userRow.role.name
				})
				const hasBothActions = canShowStatusAction && canShowRoleAction

				return (
					<Card key={userRow.user.id} className="h-full justify-between">
						<div>
							<CardHeader className="space-y-2">
								<div className="flex items-center justify-between gap-2">
									<CardTitle className="text-base">{userRow.user.name || "Sem nome cadastrado"}</CardTitle>
									<Badge variant="outline">{roleName}</Badge>
								</div>
								<CardDescription>{userRow.user.email}</CardDescription>
							</CardHeader>

							<CardContent className="space-y-2 text-sm text-muted-foreground">
								<div className="flex items-center justify-between gap-2">
									<span>Telefone</span>
									<span>{userRow.user.phone ? formatPhone(userRow.user.phone) : "-"}</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<span>Localização</span>
									<span>{locationLabel}</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<span>Convidado por</span>
									<span>{userRow.invitedByUserName ?? "-"}</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<span>Parentesco</span>
									<span>{relationshipLabel}</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<span>Status</span>
									<span className="inline-flex items-center gap-2">
										<span className={cn("size-2 rounded-full", userRow.isActive ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600")} />
										{userRow.isActive ? "Ativo" : "Inativo"}
									</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<span>Entrou em</span>
									<span>{formatDate(userRow.joinedAt)}</span>
								</div>
							</CardContent>
						</div>
						{(canShowStatusAction || canShowRoleAction) && (
							<CardFooter>
								<div className={hasBothActions ? "grid w-full grid-cols-1 gap-2 sm:grid-cols-2" : "grid w-full grid-cols-1 gap-2"}>
									{canShowRoleAction && <UserRoleActionButton user={userRow} permissionKeys={permissionKeys} availableRoles={availableRoles} />}
									{canShowStatusAction && <UserStatusActionButton user={userRow} permissionKeys={permissionKeys} />}
								</div>
							</CardFooter>
						)}
					</Card>
				)
			})}
		</div>
	)
}
