"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export const ThemeProvider = ({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) => {
	return (
		<NextThemesProvider defaultTheme="dark" enableSystem={false} {...props}>
			{children}
		</NextThemesProvider>
	)
}
