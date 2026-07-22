import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUserAction } from "@/modules/auth/server/slices/get-current-user/actions/get-current-user.action"
import { AuthBackground } from "@/modules/auth/shared/ui/auth-background"
import { AuthTabs, AuthTabsSkeleton } from "@/modules/auth/shared/ui/auth-tabs"
import { ModeToggleButton } from "@/shared/components/mode-toggle-button"

type HomePageProps = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const HomePage = async ({ searchParams }: HomePageProps) => {
	const getCurrentUserRes = await getCurrentUserAction()

	if (getCurrentUserRes.success) {
		redirect("/dashboard")
	}

	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-4 sm:p-6 md:p-10">
			<AuthBackground />

			<div className="fixed right-4 top-4 z-10">
				<ModeToggleButton />
			</div>

			<Suspense fallback={<AuthTabsSkeleton />}>
				<AuthTabs searchParams={searchParams} />
			</Suspense>
		</div>
	)
}

export default HomePage
