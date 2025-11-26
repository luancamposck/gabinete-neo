import { format } from "date-fns"

function formatDate(dateString: string): string {
	if (!dateString) return ""
	const date = new Date(dateString)
	return format(date, "dd/MM/yyyy")
}

export default formatDate
