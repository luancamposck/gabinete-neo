import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request
	})

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

	if (!supabaseUrl || !supabaseServiceRoleKey) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable")
	}

	const supabase = createServerClient(supabaseUrl, supabaseServiceRoleKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll()
			},
			setAll(cookiesToSet) {
				cookiesToSet.map(({ name, value }) => request.cookies.set(name, value))
				supabaseResponse = NextResponse.next({
					request
				})
				cookiesToSet.map(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
			}
		}
	})

	// Do not run code between createServerClient and
	// supabase.auth.getUser(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: DO NOT REMOVE auth.getUser()
	const { data } = await supabase.auth.getClaims()

	return supabaseResponse
}

export { updateSession }
