// @/modules/organizations/server/repos/get-public-asset-url.repo.ts
import { createClient } from "@/lib/supabase/server"

const PUBLIC_ASSETS_BUCKET = "public-assets"

export async function getPublicAssetUrlRepo({ path }: { path: string }) {
	const supabase = await createClient()
	const { data } = supabase.storage.from(PUBLIC_ASSETS_BUCKET).getPublicUrl(path)
	return data.publicUrl
}
