import { BRAZILIAN_CITY_COORDINATES, normalizeCityStateKey } from "@/modules/organizations/insights/people-map/shared/data/brazilian-city-coordinates"
import type { CityPin } from "@/modules/organizations/insights/people-map/shared/types/pins"
import type { OperationResponse } from "@/shared/types/operation-response.types"
import { countOrganizationMembersRepo } from "../repos/count-organization-members.repo"
import { listMembersWithCityByOrganizationIdAdminRepo } from "../repos/list-members-with-city-by-organization-id.admin.repo"
import { listUnmappedMembersByOrganizationIdAdminRepo } from "../repos/list-unmapped-members-by-organization-id.admin.repo"

const MSG_SUCCESS = "Pins carregados com sucesso."
const MSG_INFRA_ERROR = "Não foi possível carregar o mapa. Tente novamente mais tarde."
const prefixLog = "[listCityPinsForMapService]:"

const BRASILIA_KEY = "brasilia-df"
const BRASILIA_PIN_BASE: Omit<CityPin, "users"> = {
	id: "br-df-brasilia",
	city: "Brasília",
	state: "DF",
	country: "Brasil",
	lat: -15.793889,
	lng: -47.882778
}

type ServiceData = {
	pins: CityPin[]
	totalMembers: number
	mappedMembers: number
	unmappedMembers: { id: string; name: string }[]
}

export async function listCityPinsForMapService({ organizationId }: { organizationId: string }): OperationResponse<ServiceData, "infra_error"> {
	try {
		const [membersResult, countResult, unmappedResult] = await Promise.all([
			listMembersWithCityByOrganizationIdAdminRepo({ organizationId }),
			countOrganizationMembersRepo({ organizationId }),
			listUnmappedMembersByOrganizationIdAdminRepo({ organizationId })
		])

		if (membersResult.error || countResult.error || unmappedResult.error) {
			const err = membersResult.error || countResult.error || unmappedResult.error
			console.error(`${prefixLog} ${err?.message}`)
			return { success: false, message: MSG_INFRA_ERROR, code: "infra_error" }
		}

		const totalMembers = countResult.count ?? 0

		const cityGroupMap = new Map<string, { city: string; state: string; users: { id: string; name: string }[] }>()

		for (const row of membersResult.data ?? []) {
			if (!row.user) continue
			const { id, name, profile } = row.user
			if (!profile || !profile.city || !profile.state) continue

			const key = normalizeCityStateKey(profile.city, profile.state)
			const existing = cityGroupMap.get(key)
			if (existing) {
				existing.users.push({ id, name })
			} else {
				cityGroupMap.set(key, {
					city: profile.city,
					state: profile.state,
					users: [{ id, name }]
				})
			}
		}

		const pins: CityPin[] = []
		let mappedMembers = 0

		const brasiliaGroup = cityGroupMap.get(BRASILIA_KEY)
		if (brasiliaGroup) {
			pins.push({ ...BRASILIA_PIN_BASE, users: brasiliaGroup.users })
			mappedMembers += brasiliaGroup.users.length
			cityGroupMap.delete(BRASILIA_KEY)
		} else {
			pins.push({ ...BRASILIA_PIN_BASE, users: [] })
		}

		for (const [key, group] of cityGroupMap) {
			const coords = BRAZILIAN_CITY_COORDINATES.get(key)
			if (!coords) {
				console.warn(`${prefixLog} coordinates not found for key="${key}"`)
				continue
			}

			pins.push({
				id: `br-${group.state.toLowerCase()}-${key.replace(`-${group.state.toLowerCase()}`, "")}`,
				city: group.city,
				state: group.state,
				country: "Brasil",
				lat: coords.lat,
				lng: coords.lng,
				users: group.users
			})
			mappedMembers += group.users.length
		}

		const unmappedMembers: { id: string; name: string }[] = []
		for (const row of unmappedResult.data ?? []) {
			if (!row.user) continue
			const hasCity = row.user.profile?.city && row.user.profile.city.trim() !== ""
			if (!hasCity) {
				unmappedMembers.push({ id: row.user.id, name: row.user.name })
			}
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: { pins, totalMembers, mappedMembers, unmappedMembers }
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return { success: false, message: MSG_INFRA_ERROR, code: "infra_error" }
	}
}
