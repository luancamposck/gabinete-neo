// @/modules/organizations/insights/people-map/ui/map-client.tsx

"use client"

import type { CityPin } from "@/modules/organizations/insights/people-map/shared/types/pins"
import WorldPeopleMapMapLibre from "@/modules/organizations/insights/people-map/ui/world-people-map-maplibre"

type MapClientProps = {
	pins: CityPin[]
	totalMembers: number
	mappedMembers: number
	unmappedMembers: { id: string; name: string }[]
}

export default function MapClient(props: MapClientProps) {
	return <WorldPeopleMapMapLibre pins={props.pins} minZoomToShowCards={5.8} size="normal" scale={1} />
}
