"use client"
import Image from "next/image"

import { SignInAuthUserForm } from "@/components/forms/auth/sign-in-form"
import { CreateOrganizationWithOwnerUserForm } from "@/components/forms/organizations/create-organization-with-owner-user-form"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const AuthTabs = () => {
	return (
		<div className="flex w-full flex-col items-center gap-6">
			<Tabs defaultValue="login" className="w-full max-w-sm md:max-w-3xl">
				<TabsList className="w-full bg-primary-foreground">
					<TabsTrigger value="login">Login</TabsTrigger>
					<TabsTrigger value="signup">Cadastro</TabsTrigger>
				</TabsList>
				<Card className="grid grid-cols-2 p-0">
					<TabsContent value="login">
						<SignInAuthUserForm />
					</TabsContent>
					<TabsContent value="signup">
						<CreateOrganizationWithOwnerUserForm />
					</TabsContent>

					<div className="bg-muted hidden md:flex md:flex-col md:justify-center md:items-center">
						<Image src="/logo.png" width={300} height={300} alt="Gabinete NEO" />
						<h1 className="text-3xl font-semibold text-center">Gabinete NEO</h1>
					</div>
				</Card>
			</Tabs>
		</div>
	)
}
