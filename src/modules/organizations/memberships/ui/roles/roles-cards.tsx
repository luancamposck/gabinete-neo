"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type RolePermission = {
	id: string
	key: string
	description: string
}

type OrganizationRoleWithPermissions = {
	id: string
	name: string
	isActive: boolean
	isSystem: boolean
	permissions: RolePermission[]
}

type RolesCardsProps = {
	roles: OrganizationRoleWithPermissions[]
}

export const RolesCards = ({ roles }: RolesCardsProps) => {
	const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
	const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId) ?? null, [roles, selectedRoleId])

	return (
		<Sheet>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{roles.map((role) => (
					<Card key={role.id}>
						<CardHeader className="space-y-2">
							<div className="flex items-center gap-2">
								<CardTitle>{role.name}</CardTitle>
								{role.isSystem ? <Badge variant="secondary">Sistema</Badge> : null}
							</div>
							<CardDescription>{role.permissions.length} permissões vinculadas.</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{role.permissions.slice(0, 3).map((permission) => (
									<Badge key={permission.id} variant="outline">
										{permission.key}
									</Badge>
								))}
								{role.permissions.length > 3 ? <Badge variant="outline">+{role.permissions.length - 3} permissões</Badge> : null}
							</div>
						</CardContent>
						<CardFooter>
							<SheetTrigger asChild>
								<Button variant="outline" onClick={() => setSelectedRoleId(role.id)}>
									Ver permissões
								</Button>
							</SheetTrigger>
						</CardFooter>
					</Card>
				))}
			</div>

			<SheetContent side="right" className="sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>{selectedRole ? `Permissões: ${selectedRole.name}` : "Permissões do cargo"}</SheetTitle>
					<SheetDescription>Lista completa de permissões concedidas para este cargo.</SheetDescription>
				</SheetHeader>

				<ScrollArea className="mt-6 h-[75vh] pr-4">
					<div className="space-y-3">
						{selectedRole?.permissions.map((permission) => (
							<div key={permission.id} className="rounded-lg border p-3">
								<p className="text-sm font-medium">{permission.key}</p>
								<p className="text-xs text-muted-foreground mt-1">{permission.description}</p>
							</div>
						))}
						{selectedRole && selectedRole.permissions.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma permissão vinculada a este cargo.</p> : null}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	)
}
