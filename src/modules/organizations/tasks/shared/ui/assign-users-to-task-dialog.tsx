"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UserPlus2, Users } from "lucide-react"
import { type ReactNode, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { assignUsersToTaskAction } from "@/modules/organizations/tasks/server/slices/assign-users-to-task/actions/assign-users-to-task.action"
import { getAssignableUsersAction } from "@/modules/organizations/tasks/server/slices/get-assignable-users/actions/get-assignable-users.action"
import type { AssignableUserForTask } from "@/modules/organizations/tasks/shared/types/organization-tasks-table.types"

interface AssignUsersToTaskDialogProps {
	taskId: string
	trigger?: ReactNode
	onAssigned?: (data: { insertedCount: number }) => void
}

export const AssignUsersToTaskDialog = ({ taskId, trigger, onAssigned }: AssignUsersToTaskDialogProps) => {
	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState("")
	const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())

	const queryClient = useQueryClient()

	// 1) Buscar membros atribuíveis + já atribuídos via React Query
	const { data, isLoading, isError } = useQuery<{ members: AssignableUserForTask[]; assignedUserIds: string[] }, Error>({
		queryKey: ["assignable-users-for-task", taskId],
		enabled: open && !!taskId,
		queryFn: async () => {
			const res = await getAssignableUsersAction({ taskId })

			if (!res || !res.success || !res.data) {
				throw new Error(res?.message ?? "Erro ao carregar dados de atribuição da tarefa.")
			}

			return res.data
		}
	})

	const members = data?.members ?? []
	const assignedUserIds = data?.assignedUserIds ?? []

	// 2) Quando abrir e tiver data, marcar como selecionados os já atribuídos
	useEffect(() => {
		if (!open || !data) return
		setSelectedUserIds(new Set(data.assignedUserIds))
	}, [open, data])

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen)
		if (!nextOpen) {
			setSearch("")
			setSelectedUserIds(new Set())
		}
	}

	function handleToggleUser(userId: string, alreadyAssigned: boolean) {
		if (alreadyAssigned) return

		setSelectedUserIds((prev) => {
			const next = new Set(prev)
			if (next.has(userId)) {
				next.delete(userId)
			} else {
				next.add(userId)
			}
			return next
		})
	}

	const filteredMembers = useMemo(() => {
		const term = search.trim().toLowerCase()
		if (!term) return members

		return members.filter((member) => {
			const name = member.name?.toLowerCase() ?? ""
			const email = member.email?.toLowerCase() ?? ""
			return name.includes(term) || email.includes(term)
		})
	}, [members, search])

	// 3) Mutation para atribuir usuários
	const assignUsersMutation = useMutation({
		mutationFn: async (newUserIds: string[]) => {
			const res = await assignUsersToTaskAction({
				taskId,
				userIds: newUserIds
			})

			if (!res || !res.success || !res.data) {
				throw new Error(res?.message ?? "Erro ao atribuir usuários à tarefa.")
			}

			return res.data
		},
		onSuccess: (data, _newUserIds) => {
			const insertedCount = data.insertedCount

			toast.success("Usuários atribuídos com sucesso!", {
				description: insertedCount === 1 ? "1 usuário foi adicionado à tarefa." : `${insertedCount} usuários foram adicionados à tarefa.`
			})

			onAssigned?.({ insertedCount })

			void queryClient.invalidateQueries({
				queryKey: ["assignable-users-for-task", taskId]
			})

			setOpen(false)
		},
		onError: (error) => {
			console.error("[AssignUsersToTaskDialog] erro ao atribuir usuários:", error)
			toast.error("Erro ao atribuir usuários", {
				description: error instanceof Error ? error.message : "Tente novamente em instantes."
			})
		}
	})

	const isSubmitting = assignUsersMutation.isPending
	const hasMembers = members.length > 0

	function handleSubmit() {
		if (!data) return

		const selectedIds = Array.from(selectedUserIds)
		const alreadyAssignedSet = new Set(assignedUserIds)
		const newUserIds = selectedIds.filter((id) => !alreadyAssignedSet.has(id))

		if (newUserIds.length === 0) {
			toast.info("Nenhum novo usuário selecionado", {
				description: "Selecione pelo menos um usuário que ainda não está na tarefa."
			})
			return
		}

		assignUsersMutation.mutate(newUserIds)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button variant="ghost" size="sm" className="gap-2">
						<UserPlus2 className="h-4 w-4" />
						Atribuir usuários
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Atribuir usuários à tarefa</DialogTitle>
					<DialogDescription>Selecione membros da constelação para participar desta tarefa.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Users className="h-4 w-4 text-muted-foreground" />
						<p className="text-xs text-muted-foreground">
							Membros disponíveis: <span className="font-medium">{members.length}</span> • Já atribuídos: <span className="font-medium">{assignedUserIds.length}</span>
						</p>
					</div>

					<Input placeholder="Buscar por nome ou email..." value={search} onChange={(e) => setSearch(e.target.value)} disabled={isLoading || isSubmitting} />

					<div className="border rounded-md">
						<ScrollArea className="h-64">
							{isLoading && <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Carregando membros da constelação...</div>}

							{!isLoading && isError && <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Erro ao carregar membros. Tente novamente.</div>}

							{!isLoading && !isError && !hasMembers && <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Nenhum membro encontrado na constelação.</div>}

							{!isLoading && !isError && hasMembers && filteredMembers.length === 0 && <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Nenhum membro corresponde à busca.</div>}

							{!isLoading && !isError && filteredMembers.length > 0 && (
								<ul className="divide-y">
									{filteredMembers.map((member) => {
										const isAlreadyAssigned = assignedUserIds.includes(member.userId)
										const isChecked = selectedUserIds.has(member.userId)

										return (
											<li key={member.userId} className="flex items-center gap-3 px-3 py-2">
												<Checkbox checked={isChecked} disabled={isSubmitting || isAlreadyAssigned} onCheckedChange={() => handleToggleUser(member.userId, isAlreadyAssigned)} className="mt-0.5" />

												<div className="flex flex-1 flex-col">
													<span className="text-sm font-medium">{member.name}</span>
													<span className="text-xs text-muted-foreground">{member.email}</span>
													<div className="mt-1 flex flex-wrap items-center gap-2">
														<Badge variant="outline" className="text-[10px]">
															{member.role}
														</Badge>
														{isAlreadyAssigned && <Badge className="text-[10px]">Já na tarefa</Badge>}
														{!member.isActive && (
															<Badge variant="destructive" className="text-[10px]">
																Inativo na constelação
															</Badge>
														)}
													</div>
												</div>
											</li>
										)
									})}
								</ul>
							)}
						</ScrollArea>
					</div>
				</div>

				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
						Cancelar
					</Button>
					<Button onClick={handleSubmit} disabled={isSubmitting || isLoading || !hasMembers}>
						{isSubmitting ? "Atribuindo..." : "Atribuir selecionados"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
