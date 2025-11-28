function maskCpf(value: string): string {
	// Remove tudo que não for número
	let digits = value.replace(/\D/g, "")

	// Limita a 11 caracteres
	if (digits.length > 11) digits = digits.slice(0, 11)

	// Aplica máscara no formato 000.000.000-00
	return digits
		.replace(/^(\d{3})(\d)/, "$1.$2")
		.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
		.replace(/\.(\d{3})(\d)/, ".$1-$2")
}

export default maskCpf
