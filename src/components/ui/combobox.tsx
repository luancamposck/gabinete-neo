"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type ComboboxItem = {
	value: string
	label: string
	disabled?: boolean
}

type ComboboxProps = {
	items: ComboboxItem[]
	value?: string
	onValueChange: (value: string) => void
	placeholder?: string
	searchPlaceholder?: string
	emptyMessage?: string
	disabled?: boolean
}

export const Combobox = ({
	items,
	value,
	onValueChange,
	placeholder = "Selecione...",
	searchPlaceholder = "Buscar...",
	emptyMessage = "Nenhum item encontrado.",
	disabled = false
}: ComboboxProps) => {
	const [open, setOpen] = useState(false)
	const selectedItem = items.find((item) => item.value === value)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button type="button" variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between" disabled={disabled}>
					<span className="truncate">{selectedItem?.label ?? placeholder}</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyMessage}</CommandEmpty>
						<CommandGroup>
							{items.map((item) => (
								<CommandItem
									key={item.value}
									value={item.label}
									disabled={item.disabled}
									onSelect={() => {
										if (item.disabled) return
										onValueChange(item.value)
										setOpen(false)
									}}
								>
									<Check className={cn("mr-2 h-4 w-4", value === item.value ? "opacity-100" : "opacity-0")} />
									<span>{item.label}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
