// src/app/(dashboard)/tasks/components/create-organization-task-dialog.tsx

"use client"

import { PlusCircle } from "lucide-react"
import { type ReactNode, useState } from "react"

import { CreateOrganizationTaskForm } from "@/components/forms/organization-task/create-organization-task-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface CreateOrganizationTaskDialogProps {
	trigger?: ReactNode
	onTaskCreated?: (taskId: string) => void
}

export const CreateOrganizationTaskDialog = ({ trigger, onTaskCreated }: CreateOrganizationTaskDialogProps) => {
	const [open, setOpen] = useState(false)

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button variant="default" size="sm" className="gap-2">
						<PlusCircle className="h-4 w-4" />
						Nova tarefa
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="sm:max-w-lg max-w-[90vw]">
				<DialogHeader>
					<DialogTitle>Criar nova tarefa</DialogTitle>
					<DialogDescription>Defina um título e, se quiser, uma descrição inicial para a tarefa.</DialogDescription>
				</DialogHeader>

				<div className="pt-2">
					<CreateOrganizationTaskForm
						onSuccess={({ taskId }) => {
							onTaskCreated?.(taskId)
							setOpen(false)
						}}
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}
