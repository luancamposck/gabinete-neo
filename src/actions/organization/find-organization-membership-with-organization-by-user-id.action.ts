"use server"

import { findOrganizationMembershipWithOrganizationByUserIdService } from "@/services/organization/find-organization-membership-with-organization-by-user-id.service"

async function findOrganizationMembershipWithOrganizationByUserIdAction({ userId }: { userId: string }) {
	return findOrganizationMembershipWithOrganizationByUserIdService({ userId })
}

export default findOrganizationMembershipWithOrganizationByUserIdAction
