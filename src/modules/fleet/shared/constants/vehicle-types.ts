// @/modules/fleet/shared/constants/vehicle-types.ts

export const VEHICLE_TYPES = ["car", "motorcycle", "van", "truck"] as const

export type VehicleType = (typeof VEHICLE_TYPES)[number]

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
	car: "Carro",
	motorcycle: "Moto",
	van: "Van",
	truck: "Caminhão"
}
