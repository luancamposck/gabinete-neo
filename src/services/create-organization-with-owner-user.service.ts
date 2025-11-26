import { deleteAuthUserAdminRepo } from "@/repositories/auth-users/auth-users.admin.repo"
import { type CreateUserServiceParams, createUserWithProfileService } from "@/services/create-user-with-profile.service"
import { type CreateOrganizationServiceParams, createOrganizationService } from "./create-organizations.service"

export interface CreateOrganizationWithOwnerUserServiceParams {
	user: CreateUserServiceParams

	organization: CreateOrganizationServiceParams
}

export async function createOrganizationWithOwnerUserService(params: CreateOrganizationWithOwnerUserServiceParams) {
	const { user: newUserData, organization: newOrganizationData } = params

	// 1) Criação de um usuário
	const userWithProfileParams: CreateUserServiceParams = {
		name: newUserData.name,
		cpf: newUserData.cpf,

		email: newUserData.email,
		password: newUserData.password,
		phone: newUserData.phone,

		cep: newUserData.cep,
		city: newUserData.city,
		neighborhood: newUserData.neighborhood,
		number: newUserData.number,
		street: newUserData.street,
		state: newUserData.state,
		complement: newUserData.complement
	}
	const createUserWithProfileServiceRes = await createUserWithProfileService(userWithProfileParams)

	if (createUserWithProfileServiceRes.success === false) {
		const errorMessage = createUserWithProfileServiceRes.message

		console.error(errorMessage)

		return {
			success: false,
			message: errorMessage
		}
	}

	const newUserId = createUserWithProfileServiceRes.data.id

	// 2) Criação de uma Organização
	const createOrganizationServiceParams: CreateOrganizationServiceParams = {
		name: newOrganizationData.name,
		slug: newOrganizationData.slug,
		created_by_user_id: newOrganizationData.created_by_user_id,
		is_active: newOrganizationData.is_active
	}

	const createOrganizationServiceRes = await createOrganizationService(createOrganizationServiceParams)

	if (createOrganizationServiceRes.success === false) {
		const errorMessage = createOrganizationServiceRes.message

		console.log(errorMessage)

		await deleteAuthUserAdminRepo({ authUserId: newUserId })

		return {
			success: false,
			message: errorMessage
		}
	}
}
