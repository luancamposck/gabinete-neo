import { redirect } from "next/navigation"
import { Suspense } from "react"

import { Vortex } from "@/components/vortex"
import { getCurrentUserAction } from "@/modules/auth/server/slices/get-current-user/actions/get-current-user.action"
import { AuthTabs, AuthTabsSkeleton } from "@/modules/auth/ui/auth-tabs"

type HomePageProps = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const HomePage = async ({ searchParams }: HomePageProps) => {
	const getCurrentUserRes = await getCurrentUserAction()

	if (getCurrentUserRes.success) {
		redirect("/dashboard")
	}

	return (
		<div className="relative bg-muted/20 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="fixed left-0  size-full -z-20 overflow-hidden">
				<Vortex backgroundColor="transparent" className="flex size-full" rangeY={300} baseRadius={2} particleCount={50} rangeSpeed={1.5} baseHue={200} />
			</div>

			<Suspense fallback={<AuthTabsSkeleton />}>
				<AuthTabs searchParams={searchParams} />
			</Suspense>
		</div>
	)
}

export default HomePage
