// @/modules/auth/ui/auth-tabs.tsx

import { AuthTabsClient } from "@/modules/auth/shared/ui/auth-tabs-client"
import { getCurrentOrganizationAction } from "@/modules/organizations/server/slices/get-current-organization/actions/get-current-organization.action"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export const AuthTabs = async (props: { searchParams: SearchParams }) => {
	const searchParams = await props.searchParams
	const refParam = searchParams.ref
	const ref = Array.isArray(refParam) ? refParam[0] : refParam
	const hasRef = Boolean(ref?.trim())
	const initialTab = hasRef ? "signup" : "login"

	const getOrgRes = await getCurrentOrganizationAction()

	const organizationName = getOrgRes.success ? getOrgRes.data.organization.name : "Gabinete NEO"
	const imageUrl = getOrgRes.success && getOrgRes.data.organization.imageUrl ? getOrgRes.data.organization.imageUrl : "/logo.png"

	return <AuthTabsClient organizationName={organizationName} imageUrl={imageUrl} initialTab={initialTab} />
}

export const AuthTabsSkeleton = () => {
	return (
		<Tabs defaultValue="login" className="pointer-events-none w-full max-w-sm gap-4 md:max-w-3xl">
			<div className="flex flex-col items-center gap-2 md:hidden">
				<Skeleton className="size-16 rounded-2xl" />
				<Skeleton className="h-6 w-40" />
			</div>

			<TabsList className="w-full">
				<TabsTrigger value="login">Login</TabsTrigger>
				<TabsTrigger value="signup">Cadastro</TabsTrigger>
			</TabsList>
			<Card className="grid grid-cols-1 overflow-hidden p-0 shadow-xl md:grid-cols-2">
				<TabsContent value="login">
					<div className="flex flex-col gap-6">
						<div className="p-6 pb-2 md:p-8">
							<div className="flex flex-col items-center text-center gap-2">
								<Skeleton className="h-7 w-56" />
								<Skeleton className="h-4 w-64" />
							</div>

							<div className="mt-6 flex flex-col gap-6">
								<div className="flex flex-col gap-2">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-10 w-full" />
								</div>

								<div className="flex flex-col gap-2">
									<div className="flex items-center justify-between">
										<Skeleton className="h-4 w-16" />
										<Skeleton className="h-4 w-28" />
									</div>
									<Skeleton className="h-10 w-full" />
								</div>
							</div>

							<Skeleton className="mt-6 h-10 w-full" />
							<div className="mt-4 flex justify-center">
								<Skeleton className="h-4 w-56" />
							</div>
						</div>

						<div className="px-6 pb-6">
							<Skeleton className="mx-auto h-3 w-72" />
						</div>
					</div>
				</TabsContent>

				<TabsContent value="signup">
					<div className="flex flex-col gap-6">
						<div className="p-6 pb-2 md:p-8">
							<div className="flex flex-col items-center text-center gap-2">
								<Skeleton className="h-7 w-56" />
								<Skeleton className="h-4 w-64" />
							</div>

							<div className="mt-6 flex flex-col gap-6">
								<div className="flex flex-col gap-2">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-10 w-full" />
								</div>

								<div className="flex flex-col gap-2">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-10 w-full" />
								</div>

								<div className="flex flex-col gap-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-10 w-full" />
								</div>

								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<div className="flex flex-col gap-2">
										<Skeleton className="h-4 w-16" />
										<Skeleton className="h-10 w-full" />
									</div>
									<div className="flex flex-col gap-2">
										<Skeleton className="h-4 w-16" />
										<Skeleton className="h-10 w-full" />
									</div>
								</div>
							</div>

							<Skeleton className="mt-6 h-10 w-full" />
						</div>

						<div className="px-6 pb-6">
							<Skeleton className="mx-auto h-3 w-72" />
						</div>
					</div>
				</TabsContent>

				<div className="hidden bg-auth-panel md:flex md:flex-col md:items-center md:justify-center md:gap-5 md:p-10">
					<Skeleton className="size-40 rounded-3xl opacity-20" />
					<Skeleton className="h-8 w-56 opacity-20" />
					<Skeleton className="h-4 w-40 opacity-20" />
				</div>
			</Card>
		</Tabs>
	)
}
