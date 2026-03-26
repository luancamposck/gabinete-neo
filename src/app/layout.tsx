import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { QueryProvider } from "@/lib/providers/query-provider"
import { getCurrentOrganizationAction } from "@/modules/organizations/server/slices/get-current-organization/actions/get-current-organization.action"
import { ThemeProvider } from "@/shared/components/theme-provider"
import { Toaster } from "@/shared/components/ui/sonner"

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
	const getOrgRes = await getCurrentOrganizationAction()
	if (getOrgRes.success === false) return METADATA_FALLBACK

	const { organization } = getOrgRes.data

	const title = organization.name
	const description = organization.description ?? ""

	if (!organization.imageUrl) {
		return {
			title,
			description
		}
	}

	return {
		title,
		description,
		openGraph: {
			images: [{ url: organization.imageUrl, width: 1200, height: 630, alt: title }]
		},
		twitter: {
			card: "summary_large_image",
			images: [organization.imageUrl] // URL absoluta
		}
	}
}

export const dynamic = "force-dynamic"

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
