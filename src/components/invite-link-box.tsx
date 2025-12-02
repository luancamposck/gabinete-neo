// src/components/invite/invite-link-box.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { generateInviteLinkAction } from "@/actions/generate-invite-link.action"
import { cn } from "@/lib/utils"

interface InviteLinkBoxProps {
  organizationId: string
  organizationSlug: string
  className?: string
}

export function InviteLinkBox({ organizationId, organizationSlug, className }: InviteLinkBoxProps) {
  const [inviteUrl, setInviteUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleClick() {
    try {
      setIsLoading(true)

      let url = inviteUrl

      if (!url) {
        const res = await generateInviteLinkAction({ organizationId, organizationSlug })

        if (!res || !res.success || !res.data?.inviteUrl) {
          toast.error("Não foi possível gerar o link de convite.", {
            description: res?.message ?? "Tente novamente em alguns instantes.",
          })
          return
        }

        url = res.data.inviteUrl
        setInviteUrl(url)
      }

      await navigator.clipboard.writeText(url)

      toast.success("Link de convite copiado!", {
        description: url,
      })
    } catch (error) {
      console.error("[InviteLinkBox] Erro ao gerar/copiar link:", error)
      toast.error("Erro ao copiar o link de convite.", {
        description:
          error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition hover:bg-muted",
        isLoading && "opacity-70 cursor-wait",
        className
      )}
    >
      <span className="truncate">
        {inviteUrl
          ? inviteUrl
          : isLoading
          ? "Gerando link de convite..."
          : "Clique aqui para gerar e copiar seu link de convite"}
      </span>
      <span className="ml-3 text-xs text-muted-foreground">
        {inviteUrl ? "Clique para copiar" : ""}
      </span>
    </div>
  )
}
