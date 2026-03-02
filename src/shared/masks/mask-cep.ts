export function maskCep(value: string): string {
	let digits = value.replace(/\D/g, "")
	if (digits.length > 8) digits = digits.slice(0, 8)

	// Formato: 12345-678
	return digits.replace(/^(\d{5})(\d{0,3}).*/, "$1-$2")
}
