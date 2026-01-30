// @/modules/organizations/insights/people-map/ui/map-client.tsx

"use client"

import { pins } from "@/modules/organizations/insights/people-map/shared/mocks/pins.mock"
import WorldPeopleMapMapLibre from "@/modules/organizations/insights/people-map/ui/world-people-map-maplibre"

export default function MapClient() {
	return <WorldPeopleMapMapLibre pins={pins} minZoomToShowCards={5.8} size="normal" scale={1} />
}
