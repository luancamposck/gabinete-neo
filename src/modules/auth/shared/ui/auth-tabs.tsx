// @/modules/auth/ui/auth-tabs.tsx

import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RegisterAndJoinForm } from "@/modules/accounts/onboarding/shared/ui/register-and-join-form"
import { SignInForm } from "@/modules/auth/shared/ui/sign-in-form"
import { getCurrentOrganizationAction } from "@/modules/organizations/server/slices/get-current-organization/actions/get-current-organization.action"
import { Card } from "@/shared/components/ui/card"

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

	return (
		<Tabs defaultValue={initialTab} className="w-full max-w-sm md:max-w-3xl">
			<Image src={imageUrl} width={500} height={500} alt={organizationName} className="w-3/4 mx-auto md:hidden" />

			<TabsList className="w-full bg-primary-foreground">
				<TabsTrigger value="login">Login</TabsTrigger>
				<TabsTrigger value="signup">Cadastro</TabsTrigger>
			</TabsList>

			<Card className="grid grid-cols-1 md:grid-cols-2 p-0">
				<TabsContent value="login">
					<SignInForm organizationName={organizationName} />
				</TabsContent>
				<TabsContent value="signup">
					<RegisterAndJoinForm />
				</TabsContent>

				<div className="bg-muted hidden md:flex md:flex-col md:justify-center md:items-center">
					<Image src={imageUrl} width={300} height={300} alt={organizationName} />
					<h1 className="text-3xl font-semibold text-center">{organizationName}</h1>
				</div>
			</Card>
		</Tabs>
	)
}

export const AuthTabsSkeleton = () => {
	return (
		<Tabs defaultValue="login" className="pointer-events-none w-full max-w-sm md:max-w-3xl">
			<TabsList className="w-full bg-primary-foreground">
				<TabsTrigger value="login">Login</TabsTrigger>
				<TabsTrigger value="signup">Cadastro</TabsTrigger>
			</TabsList>
			<Card className="grid grid-cols-1 md:grid-cols-2 p-0">
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

				<div className="bg-muted hidden md:flex md:flex-col md:justify-center md:items-center">
					<Skeleton className="h-[300px] w-[300px]" />
					<Skeleton className="mt-4 h-8 w-56" />
				</div>
			</Card>
		</Tabs>
	)
}
