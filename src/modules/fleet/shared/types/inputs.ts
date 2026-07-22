// @/modules/fleet/shared/types/inputs.ts
import type { VehicleType } from "@/modules/fleet/shared/types/db"

export type RegisterAsDriverParams = {
	email: string
	password: string

	name: string
	username: string
	phone: string

	cep: string
	state: string
	city: string
	neighborhood: string
	street: string
	number: string
	complement?: string

	plate: string
	vehicleType: VehicleType
	vehicleModel?: string
	vehicleYear?: number
	vehicleColor?: string

	crlv: File
	cnh: File

	ref?: string
	relationshipToInviter?: string
}
