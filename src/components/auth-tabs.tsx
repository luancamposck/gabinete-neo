"use client"

import { SignInForm } from "@/components/forms/auth/sign-in-form"
import { SignUpForm } from "@/components/forms/auth/sign-up-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const AuthTabs = () => {
	return (
		<div className="flex w-full flex-col items-center gap-6">
			<Tabs defaultValue="login" className="w-full max-w-sm md:max-w-3xl">
				<TabsList className="w-full bg-primary-foreground">
					<TabsTrigger value="login">Login</TabsTrigger>
					<TabsTrigger value="signup">Cadastro</TabsTrigger>
				</TabsList>
				<TabsContent value="login">
					<SignInForm />
				</TabsContent>
				<TabsContent value="signup">
					<SignUpForm />
				</TabsContent>
			</Tabs>
		</div>
	)
}
