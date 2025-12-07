import { findOrganizationBySlugService } from "@/services/organization/find-organization-by-slug.service"

async function findOrganizationBySlugAction({ organizationSlug }: { organizationSlug: string }) {
	return findOrganizationBySlugService({ organizationSlug })
}

export default findOrganizationBySlugAction
