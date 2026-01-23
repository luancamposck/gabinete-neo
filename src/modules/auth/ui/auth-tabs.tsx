// @/modules/auth/ui/auth-tabs.tsx
"use client"

import Image from "next/image"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RegisterAndJoinForm } from "@/modules/accounts/onboarding/ui/register-and-join-form"
import { SignInForm } from "@/modules/auth/ui/sign-in-form"

export const AuthTabs = () => {
	return (
		<div className="flex w-full flex-col items-center gap-6">
			<Tabs defaultValue="login" className="w-full max-w-sm md:max-w-3xl">
				<TabsList className="w-full bg-primary-foreground">
					<TabsTrigger value="login">Login</TabsTrigger>
					<TabsTrigger value="signup">Cadastro</TabsTrigger>
				</TabsList>
				<Card className="grid grid-cols-1 md:grid-cols-2 p-0">
					<TabsContent value="login">
						<SignInForm />
					</TabsContent>
					<TabsContent value="signup">
						<RegisterAndJoinForm />
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
