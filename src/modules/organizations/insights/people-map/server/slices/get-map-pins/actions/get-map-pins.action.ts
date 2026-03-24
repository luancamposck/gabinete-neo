// @/modules/organizations/insights/people-map/server/slices/get-map-pins/actions/get-map-pins.action.ts
"use server"

import { getMapPinsUseCase } from "@/modules/organizations/insights/people-map/server/slices/get-map-pins/use-cases/get-map-pins.use-case"

export async function getMapPinsAction() {
	return getMapPinsUseCase()
}
