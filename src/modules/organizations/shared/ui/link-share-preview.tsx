// @/modules/organizations/shared/ui/link-share-preview.tsx
"use client"

import Image from "next/image"
import { useOrganizationConfig } from "@/modules/organizations/shared/ui/organization-config.context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

type LinkSharePreviewProps = {
	exampleLink: string
}

export const LinkSharePreview = ({ exampleLink }: LinkSharePreviewProps) => {
	const { name, description, imageUrl } = useOrganizationConfig()

	const previewTitle = name.trim() ? name : "Sua organização"
	const previewDescription = description?.trim() ? description : "Adicione uma descrição para aparecer aqui."

	return (
		<Card>
			<CardHeader className="gap-2">
				<CardTitle>Prévia de compartilhamento</CardTitle>
				<CardDescription>Exemplo de como sua organização pode aparecer quando alguém compartilha um link.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="rounded-md border bg-muted/30 p-3">
					<div className="flex items-center gap-3">
						{imageUrl ? (
							<div className="h-12 w-12 overflow-hidden rounded-md bg-primary/10">
								<Image src={imageUrl} alt="Imagem da organização" width={48} height={48} className="h-full w-full object-cover" />
							</div>
						) : (
							<div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">LOGO</div>
						)}
						<div className="space-y-1">
							<div className="text-sm font-semibold">{previewTitle}</div>
							<div className="text-xs text-muted-foreground">{previewDescription}</div>
						</div>
					</div>
					<div className="mt-3 rounded-md bg-background px-3 py-2 text-[11px] text-muted-foreground">Link de exemplo: {exampleLink}</div>
					<div className="mt-2 text-[11px] text-muted-foreground">Esse bloco é só uma prévia visual. Imagem e detalhes aparecem sempre que você compartilha o link com alguém.</div>
				</div>
			</CardContent>
		</Card>
	)
}
