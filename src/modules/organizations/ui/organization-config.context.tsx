// @/modules/organizations/ui/organization-config.context.tsx
"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type OrganizationConfigContextValue = {
	name: string
	description: string | null
	imageUrl: string | null
	setName: (name: string) => void
	setDescription: (description: string | null) => void
	setImageUrl: (imageUrl: string | null) => void
}

const OrganizationConfigContext = createContext<OrganizationConfigContextValue | null>(null)

type ProviderProps = {
	initialName: string
	initialDescription: string | null
	initialImageUrl: string | null
	children: React.ReactNode
}

export const OrganizationConfigProvider = (props: ProviderProps) => {
	const { initialName, initialDescription, initialImageUrl, children } = props

	const [name, setName] = useState<string>(initialName)
	const [description, setDescription] = useState<string | null>(initialDescription)
	const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl)

	// Keep the context synced if server-provided props change after navigation.
	useEffect(() => {
		setName(initialName)
	}, [initialName])

	useEffect(() => {
		setDescription(initialDescription)
	}, [initialDescription])

	useEffect(() => {
		setImageUrl(initialImageUrl)
	}, [initialImageUrl])

	const value = useMemo<OrganizationConfigContextValue>(
		() => ({
			name,
			description,
			imageUrl,
			setName,
			setDescription,
			setImageUrl
		}),
		[name, description, imageUrl]
	)

	return <OrganizationConfigContext.Provider value={value}>{children}</OrganizationConfigContext.Provider>
}

export function useOrganizationConfig() {
	const context = useContext(OrganizationConfigContext)
	if (!context) {
		throw new Error("useOrganizationConfig must be used within OrganizationConfigProvider.")
	}

	return context
}
