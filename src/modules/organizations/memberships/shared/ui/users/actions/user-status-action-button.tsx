"use client"

import { ToggleLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import { PERMISSIONS, type PermissionKey } from "@/modules/auth/shared/permissions"
import { updateMembershipStatusAction } from "@/modules/organizations/memberships/server/slices/update-membership-status/actions/update-membership-status.action"
import type { OrganizationUserTableRow } from "@/modules/organizations/memberships/shared/types/organization-users-table.types"

type UserStatusActionButtonProps = {
	user: OrganizationUserTableRow
	permissionKeys: PermissionKey[]
	iconOnly?: boolean
}

export const canShowUserStatusAction = (params: { permissionKeys: PermissionKey[]; roleName: string }) => {
	const permissionsSet = new Set(params.permissionKeys)
	const canManageMemberStatus = permissionsSet.has(PERMISSIONS.ORG_MEMBERSHIP_STATUS_UPDATE)
	const canManageMemberStatusPrivileged = permissionsSet.has(PERMISSIONS.ORG_MEMBERSHIP_STATUS_UPDATE_PRIVILEGED)
	const isTargetPrivilegedRole = ["OWNER", "ADMIN"].includes(params.roleName.toUpperCase())
	const canToggleNonPrivilegedStatus = canManageMemberStatus || canManageMemberStatusPrivileged
	return isTargetPrivilegedRole ? canManageMemberStatusPrivileged : canToggleNonPrivilegedStatus
}

export const UserStatusActionButton = ({ user, permissionKeys, iconOnly = false }: UserStatusActionButtonProps) => {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const canShowStatusToggle = useMemo(() => canShowUserStatusAction({ permissionKeys, roleName: user.role.name }), [permissionKeys, user.role.name])

	if (!canShowStatusToggle) {
		return null
	}

	const handleToggleMemberStatus = async () => {
		if (isSubmitting) return

		setIsSubmitting(true)

		const result = await updateMembershipStatusAction({
			memberUserId: user.user.id,
			isActive: !user.isActive
		})

		if (result.success) {
			toast.success("Status atualizado", {
				description: result.message
			})
			router.refresh()
			setIsSubmitting(false)
			return
		}

		toast.error("Não foi possível atualizar", {
			description: result.message
		})
		setIsSubmitting(false)
	}

	if (iconOnly) {
		return (
			<Button variant="ghost" size="icon" className="size-8 p-0" aria-label={user.isActive ? "Inativar usuário" : "Ativar usuário"} onClick={handleToggleMemberStatus} disabled={isSubmitting}>
				<ToggleLeft className={cn("size-4", user.isActive && "rotate-180 text-destructive")} />
			</Button>
		)
	}

	return (
		<Button type="button" variant={user.isActive ? "destructive" : "outline"} onClick={handleToggleMemberStatus} disabled={isSubmitting} className="w-full">
			{isSubmitting ? "Salvando..." : user.isActive ? "Inativar usuário" : "Ativar usuário"}
		</Button>
	)
}
