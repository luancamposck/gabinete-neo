// @/modules/organizations/memberships/ui/join-organization-button.tsx

"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { joinCurrentOrganizationAction } from "@/modules/organizations/memberships/server/slices/join-current-organization/actions/join-current-organization.action"
import { Button } from "@/shared/components/ui/button"

export const JoinOrganizationButton = () => {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	function handleJoin() {
		startTransition(async () => {
			const res = await joinCurrentOrganizationAction()

			if (!res) {
				throw new Error("Não foi possível entrar na constelação.")
			}

			if (res.success === true) {
				router.replace("/dashboard")
				return
			}

			if (res.code === "unauthenticated") {
				toast.error("Sua sessão expirou. Faça login novamente.")
				router.replace("/")
				return
			}

			if (res.code === "org_not_found") {
				toast.error("Este domínio não está configurado. Você será redirecionado.")
				router.replace("/tenant-not-found?from=join")
				return
			}

			if (res.code === "infra_error") {
				throw new Error(res.message)
			}

			throw new Error(res.message ?? "Não foi possível entrar na constelação.")
		})
	}

	return (
		<Button type="button" className="w-full" onClick={handleJoin} disabled={isPending}>
			{isPending ? "Entrando..." : "Entrar na constelação"}
		</Button>
	)
}
