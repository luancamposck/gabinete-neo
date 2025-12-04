import { deleteAuthUserAdminRepo } from "@/repositories/auth-users/auth-users.admin.repo"
import { deleteOrganizationsAdminRepo } from "@/repositories/organizations/organizations.admin.repo"
import { type CreateOrganizationServiceParams, createOrganizationService } from "@/services/organization/create-organizations.service"
import { type CreateOrganizationMenbershipServiceParams, createOrganizationMenbershipService } from "@/services/organization-membership/create-organization-menbership.service"
import { type CreateUserServiceParams, createUserWithProfileService } from "@/services/users/create-user-with-profile.service"
import type { OperationResponse } from "@/types/operation-response"

export interface CreateOrganizationWithOwnerUserServiceParams {
	user: CreateUserServiceParams

	organization: Omit<CreateOrganizationServiceParams, "created_by_user_id">
}

export async function createOrganizationWithOwnerUserService(params: CreateOrganizationWithOwnerUserServiceParams): Promise<OperationResponse<{ organizationId: string; userId: string }>> {
	const { user: newUserData, organization: newOrganizationData } = params

	// 1) Criação de usuário
	const createUserWithProfileServiceParams: CreateUserServiceParams = {
		email: newUserData.email,
		password: newUserData.password,

		name: newUserData.name,
		cpf: newUserData.cpf,
		phone: newUserData.phone,

		cep: newUserData.cep,
		street: newUserData.street,
		number: newUserData.number,
		neighborhood: newUserData.neighborhood,
		city: newUserData.city,
		state: newUserData.state,
		complement: newUserData.complement
	}

	const createUserWithProfileServiceRes = await createUserWithProfileService(createUserWithProfileServiceParams)

	if (createUserWithProfileServiceRes.success === false) {
		const errorMessage = createUserWithProfileServiceRes.message

		console.error(errorMessage)

		return {
			success: false,
			message: errorMessage
		}
	}

	const createdUserId = createUserWithProfileServiceRes.data.id

	// 2) Criação de organização(organization)
	const createOrganizationServiceParams: CreateOrganizationServiceParams = {
		name: newOrganizationData.name,
		slug: newOrganizationData.slug,

		created_by_user_id: createdUserId
	}

	const createOrganizationServiceRes = await createOrganizationService(createOrganizationServiceParams)

	if (createOrganizationServiceRes.success === false) {
		await deleteAuthUserAdminRepo({ authUserId: createdUserId })

		const errorMessage = createOrganizationServiceRes.message

		console.error(errorMessage)

		return {
			success: false,
			message: errorMessage
		}
	}

	const createdOrganizationId = createOrganizationServiceRes.data.organizationId

	// 3) Criar vínculo entre usuário e organização
	const createOrganizationMenbershipServiceParams: CreateOrganizationMenbershipServiceParams = {
		organization_id: createdOrganizationId,
		user_id: createdUserId,

		role: "OWNER",
		is_active: true
	}

	const createOrganizationMenbershipServiceRes = await createOrganizationMenbershipService(createOrganizationMenbershipServiceParams)

	if (createOrganizationMenbershipServiceRes.success === false) {
		await deleteAuthUserAdminRepo({ authUserId: createdUserId })
		await deleteOrganizationsAdminRepo({ organizationId: createdOrganizationId })

		const errorMessage = createOrganizationMenbershipServiceRes.message

		console.error(errorMessage)

		return {
			success: false,
			message: errorMessage
		}
	}

	// 4) Retorno se deu tudo certo
	return {
		success: true,
		message: "Usuário e organização criados com sucesso",
		data: {
			organizationId: createdOrganizationId,
			userId: createdUserId
		}
	}
}
