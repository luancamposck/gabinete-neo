// src/constants/relationship-options.ts
export const RELATIONSHIP_OPTIONS = [
	{ value: "SPOUSE", label: "Cônjuge" },
	{ value: "PARTNER", label: "Companheiro(a)" },
	{ value: "SON", label: "Filho" },
	{ value: "DAUGHTER", label: "Filha" },
	{ value: "FATHER", label: "Pai" },
	{ value: "MOTHER", label: "Mãe" },
	{ value: "BROTHER", label: "Irmão" },
	{ value: "SISTER", label: "Irmã" },
	{ value: "UNCLE_AUNT", label: "Tio/Tia" },
	{ value: "NEPHEW_NIECE", label: "Sobrinho(a)" },
	{ value: "COUSIN", label: "Primo(a)" },
	{ value: "GRANDFATHER", label: "Avô" },
	{ value: "GRANDMOTHER", label: "Avó" },
	{ value: "GRANDCHILD", label: "Neto(a)" },
	{ value: "FRIEND", label: "Amigo(a)" },
	{ value: "COLLEAGUE", label: "Colega de trabalho" },
	{ value: "NEIGHBOR", label: "Vizinho(a)" },
	{ value: "OTHER", label: "Outro" }
] as const

export type RelationshipValue = (typeof RELATIONSHIP_OPTIONS)[number]["value"]
