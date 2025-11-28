// src/lib/utils/slugify-utils.ts
export function slugify(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // remove acentos
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-") // tudo que não é [a-z0-9] vira "-"
		.replace(/^-+|-+$/g, "") // tira "-" do começo/fim
}
