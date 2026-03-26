// @/modules/organizations/insights/people-map/shared/ui/map-client.tsx

"use client"

import { useState } from "react"
import type { CityPin } from "@/modules/organizations/insights/people-map/shared/types/pins"
import WorldPeopleMapMapLibre from "@/modules/organizations/insights/people-map/shared/ui/world-people-map-maplibre"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { ScrollArea } from "@/shared/components/ui/scroll-area"

type MapClientProps = {
	pins: CityPin[]
	totalMembers: number
	mappedMembers: number
	unmappedMembers: { id: string; name: string }[]
}

export default function MapClient({ pins, totalMembers, mappedMembers, unmappedMembers }: MapClientProps) {
	const [unmappedDialogOpen, setUnmappedDialogOpen] = useState(false)

	if (mappedMembers === 0) {
		return (
			<div className="relative">
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
					<p className="text-muted-foreground text-sm">Nenhum membro com endereço cadastrado</p>
				</div>
				<WorldPeopleMapMapLibre pins={pins} minZoomToShowCards={5.8} size="normal" scale={1} />
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3">
				<Badge variant="secondary">
					{mappedMembers} de {totalMembers} membros mapeados
				</Badge>
				{mappedMembers < totalMembers && (
					<Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setUnmappedDialogOpen(true)}>
						Ver não-mapeados
					</Button>
				)}
			</div>

			<WorldPeopleMapMapLibre pins={pins} minZoomToShowCards={5.8} size="normal" scale={1} />

			<Dialog open={unmappedDialogOpen} onOpenChange={setUnmappedDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Membros não-mapeados</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-80">
						<ul className="space-y-2">
							{unmappedMembers.map((member) => (
								<li key={member.id} className="text-sm text-muted-foreground">
									{member.name}
								</li>
							))}
						</ul>
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</div>
	)
}
