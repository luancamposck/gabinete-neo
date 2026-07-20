"use client"

import { ExternalLink } from "lucide-react"
import type { PreviewDocument } from "@/modules/fleet/shared/ui/applications/application-visuals"
import { SignedDocumentFrame } from "@/modules/fleet/shared/ui/applications/signed-document-frame"
import { Button } from "@/shared/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet"

type DocumentPreviewSheetProps = {
	document: PreviewDocument | null
	onOpenChange: (open: boolean) => void
}

// Preview inline de CRLV/CNH. iframe renderiza tanto imagem quanto PDF servidos
// pela signed URL do storage, sem tirar a pessoa da fila.
export const DocumentPreviewSheet = ({ document, onOpenChange }: DocumentPreviewSheetProps) => {
	return (
		<Sheet open={document !== null} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl">
				{document && (
					<>
						<SheetHeader className="border-b">
							<SheetTitle>{document.label}</SheetTitle>
							<SheetDescription>{document.candidateName}</SheetDescription>
						</SheetHeader>

						<div className="min-h-0 flex-1 bg-muted/40">
							<SignedDocumentFrame url={document.url} title={`${document.label} — ${document.candidateName}`} />
						</div>

						<div className="flex items-center justify-end border-t p-4">
							<Button asChild variant="outline" size="sm">
								<a href={document.url} target="_blank" rel="noopener noreferrer">
									<ExternalLink aria-hidden />
									Abrir em nova aba
								</a>
							</Button>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	)
}
