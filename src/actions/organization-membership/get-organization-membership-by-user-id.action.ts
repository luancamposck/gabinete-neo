"use server"

import { getOrganizationMembershipByUserIdService } from "@/services/organization-membership/get-organization-membership-by-user-id.service"

async function getOrganizationMembershipByUserIdAction({ userId }: { userId: string }) {
	return getOrganizationMembershipByUserIdService({ userId })
}

export default getOrganizationMembershipByUserIdAction
