import { z } from "zod"

const normalizePermissionKeys = (permissionKeys: string[]) => [...new Set(permissionKeys.map((permissionKey) => permissionKey.trim()).filter((permissionKey) => permissionKey.length > 0))]

export const createRoleSchemaClient = (availablePermissionKeys: string[]) => {
	const allowedPermissionKeys = new Set(normalizePermissionKeys(availablePermissionKeys))

	return z.object({
		name: z.string().trim().min(3, "O nome do cargo deve ter pelo menos 3 caracteres.").max(80, "O nome do cargo deve ter no máximo 80 caracteres."),
		permissions: z.array(z.string()).superRefine((permissionKeys, ctx) => {
			const hasInvalidPermission = permissionKeys.some((permissionKey) => !allowedPermissionKeys.has(permissionKey))

			if (hasInvalidPermission) {
				ctx.addIssue({
					code: "custom",
					message: "Existe permissão inválida selecionada para este contexto."
				})
			}
		})
	})
}

export type CreateRoleSchemaClientData = z.infer<ReturnType<typeof createRoleSchemaClient>>
