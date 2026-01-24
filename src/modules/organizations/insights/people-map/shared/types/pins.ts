export type CityPin = {
	id: string
	city: string
	state?: string
	country: string
	lat: number
	lng: number
	users: { id: string; name: string }[]
}
