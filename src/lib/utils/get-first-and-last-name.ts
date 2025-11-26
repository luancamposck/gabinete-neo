function getFirstAndLastName(name: string | null | undefined): string {
	if (!name) return "N/A"
	const names = name.split(" ").filter(Boolean)
	if (names.length <= 2) return name
	return `${names[0]} ${names[names.length - 1]}`
}

export default getFirstAndLastName
