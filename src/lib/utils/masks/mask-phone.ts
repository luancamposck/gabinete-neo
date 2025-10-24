function maskPhone(value: string): string {
  // Remove tudo que não for número
  let v = value.replace(/\D/g, "")
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2")
  if (v.length > 13) {
    v = v.replace(/(\d{5})(\d)/, "$1-$2")
  } else {
    v = v.replace(/(\d{4})(\d)/, "$1-$2")
  }
  return v.slice(0, 15)
}

export default maskPhone
