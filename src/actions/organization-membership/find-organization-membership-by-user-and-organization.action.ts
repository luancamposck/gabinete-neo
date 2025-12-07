"use server"

import { findOrganizationMembershipByUserAndOrganizationService } from "@/services/organization-membership/find-organization-membership-by-user-and-organization.service"

async function findOrganizationMembershipByUserAndOrganizationAction({ userId, organizationId }: { userId: string; organizationId: string }) {
	return findOrganizationMembershipByUserAndOrganizationService({ userId, organizationId })
}

export default findOrganizationMembershipByUserAndOrganizationAction
