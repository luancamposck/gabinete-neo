"use client"

import { MapPin } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { OrganizationMemberTableAddress } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import { Button } from "@/shared/components/ui/button"

type MemberAddressPopoverProps = {
	address: OrganizationMemberTableAddress | null | undefined
}

export const MemberAddressPopover = ({ address }: MemberAddressPopoverProps) => {
	if (!address) return null

	const { city, state, street, number, neighborhood, cep, complement } = address

	const hasAddress = city || state || street || number || neighborhood || cep || (complement && complement.trim() !== "")
	if (!hasAddress) return null

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
					<MapPin className="h-4 w-4" />
					<span className="sr-only">Ver endereço completo</span>
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-80 p-3 space-y-3 text-sm">
				<div className="flex items-start gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
						<MapPin className="h-4 w-4 text-primary" />
					</div>
					<div className="space-y-1">
						<p className="text-sm font-semibold">Endereço completo</p>
						<p className="text-xs text-muted-foreground">Dados cadastrados para este membro.</p>
					</div>
				</div>

				<div className="rounded-md border bg-muted/40 p-3 space-y-2">
					{(street || number) && (
						<div className="flex flex-col">
							<span className="text-[11px] font-medium uppercase text-muted-foreground">Rua e número</span>
							<span>
								{street ?? "—"}
								{street && number ? ", " : ""}
								{street && !number && " "}
								{number ?? (street ? "s/n" : "")}
							</span>
						</div>
					)}

					{neighborhood && (
						<div className="flex flex-col">
							<span className="text-[11px] font-medium uppercase text-muted-foreground">Bairro</span>
							<span>{neighborhood}</span>
						</div>
					)}

					{(city || state) && (
						<div className="flex flex-col">
							<span className="text-[11px] font-medium uppercase text-muted-foreground">Cidade / Estado</span>
							<span>
								{city ?? "—"}
								{state ? ` / ${state}` : ""}
							</span>
						</div>
					)}

					{cep && (
						<div className="flex flex-col">
							<span className="text-[11px] font-medium uppercase text-muted-foreground">CEP</span>
							<span>{cep}</span>
						</div>
					)}

					{complement && complement.trim() !== "" && (
						<div className="flex flex-col">
							<span className="text-[11px] font-medium uppercase text-muted-foreground">Complemento</span>
							<span>{complement}</span>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}
