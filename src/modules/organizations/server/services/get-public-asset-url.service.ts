// @/modules/organizations/server/services/get-public-asset-url.service.ts
import { getPublicAssetUrlRepo } from "@/modules/organizations/server/repos/get-public-asset-url.repo"

export async function getPublicAssetUrlService({ path }: { path: string }) {
	return getPublicAssetUrlRepo({ path })
}
