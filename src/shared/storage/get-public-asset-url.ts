// @/shared/storage/get-public-asset-url.ts
import { createClient } from "@/lib/supabase/server"

const PUBLIC_ASSETS_BUCKET = "public-assets"

export async function getPublicAssetUrl({ path }: { path: string }) {
	// getPublicUrl não precisa de await, e funciona com client normal também
	const supabase = await createClient()
	const { data } = supabase.storage.from(PUBLIC_ASSETS_BUCKET).getPublicUrl(path)
	return data.publicUrl
}
