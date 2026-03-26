import type { OrganizationReferralTableRow } from "@/modules/organizations/referrals/shared/types/organization-referrals-table.types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { RELATIONSHIP_OPTIONS } from "@/shared/constants/relationship-options"

const relationshipLabelMap: Record<string, string> = RELATIONSHIP_OPTIONS.reduce(
	(acc, option) => {
		acc[option.value] = option.label
		return acc
	},
	{} as Record<string, string>
)

function formatDate(value: string) {
	const parsedDate = new Date(value)

	if (Number.isNaN(parsedDate.getTime())) return "-"

	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}).format(parsedDate)
}

type OrganizationReferralsTableProps = {
	data: OrganizationReferralTableRow[]
}

export const OrganizationReferralsTable = ({ data }: OrganizationReferralsTableProps) => {
	return (
		<div className="rounded-md border bg-card">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Usuário convidado</TableHead>
						<TableHead>Indicado por</TableHead>
						<TableHead>Relação</TableHead>
						<TableHead>Data da indicação</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.length > 0 ? (
						data.map((referral) => {
							const invitedLabel = referral.invitedUserName ?? referral.invitedUserEmail ?? "Usuário não encontrado"
							const inviterLabel = referral.inviterUserName ?? referral.inviterUserEmail ?? "Usuário não encontrado"
							const relationshipLabel = referral.relationshipToInviter ? (relationshipLabelMap[referral.relationshipToInviter] ?? referral.relationshipToInviter) : "-"

							return (
								<TableRow key={referral.id}>
									<TableCell className="font-medium">{invitedLabel}</TableCell>
									<TableCell>{inviterLabel}</TableCell>
									<TableCell>{relationshipLabel}</TableCell>
									<TableCell>{formatDate(referral.createdAt)}</TableCell>
								</TableRow>
							)
						})
					) : (
						<TableRow>
							<TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
								Nenhuma indicação encontrada.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	)
}
