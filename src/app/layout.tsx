import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { QueryProvider } from "@/providers/query-provider"
import { getRequestHost } from "@/shared/http/get-request-host"

import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"]
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"]
})

const METADATA_FALLBACK: Metadata = {
	title: "Gabinete NEO",
	description: ""
}

export async function generateMetadata(): Promise<Metadata> {
	const host = await getRequestHost()
	if (!host) {
		return METADATA_FALLBACK
	}

	const getOrgIdRes = await getOrganizationIdByAppDomainService({ appDomain: host })
	if (getOrgIdRes.success === false) return METADATA_FALLBACK

	const { organizationId } = getOrgIdRes.data

	const getOrgRes = await getOrganizationByIdService({ organizationId })
	if (getOrgRes.success === false) return METADATA_FALLBACK

	const { organization } = getOrgRes.data

	// fallback caso não exista config pra esse host
	const title = organization.name

	return {
		title,
		description: ""
	}
}

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
	return (
		<html lang="pt-BR">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
				<QueryProvider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						{children}
						<Toaster richColors />
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	)
}

export default RootLayout
