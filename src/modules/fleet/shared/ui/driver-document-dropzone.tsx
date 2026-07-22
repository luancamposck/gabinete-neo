// @/modules/fleet/shared/ui/driver-document-dropzone.tsx

"use client"

import type { LucideIcon } from "lucide-react"
import { X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/shared/components/ui/button"

type DriverDocumentDropzoneProps = {
	id: string
	file: File | undefined
	onChange: (file: File | undefined) => void
	accept: string
	icon: LucideIcon
	hint: string
	invalid?: boolean
	disabled?: boolean
}

const formatFileSize = (bytes: number) => {
	if (bytes < 1024) return `${bytes} B`
	const kb = bytes / 1024
	if (kb < 1024) return `${kb.toFixed(0)} KB`
	return `${(kb / 1024).toFixed(1)} MB`
}

// Zona de clique/arraste-e-solte para CRLV/CNH. Validação de tipo/tamanho continua
// centralizada no schema zod — este componente só cuida da UX de seleção/preview.
export const DriverDocumentDropzone = ({ id, file, onChange, accept, icon: Icon, hint, invalid, disabled }: DriverDocumentDropzoneProps) => {
	const [isDragging, setIsDragging] = useState(false)

	const handleFiles = (files: FileList | null) => {
		const next = files?.[0]
		if (next) onChange(next)
	}

	return (
		<fieldset
			aria-label="Área de upload de documento"
			className={cn("rounded-lg border transition-colors", file ? "border-solid bg-muted/30" : "border-dashed", isDragging ? "border-primary bg-primary/5" : invalid ? "border-destructive" : "border-input")}
			onDragOver={(e) => {
				e.preventDefault()
				if (!disabled) setIsDragging(true)
			}}
			onDragLeave={() => setIsDragging(false)}
			onDrop={(e) => {
				e.preventDefault()
				setIsDragging(false)
				if (!disabled) handleFiles(e.dataTransfer.files)
			}}
		>
			<output className="sr-only">{file ? `Arquivo selecionado: ${file.name}` : "Nenhum arquivo selecionado"}</output>

			{file ? (
				<div className="flex items-center gap-3 p-3">
					<span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
						<Icon aria-hidden className="size-4" />
					</span>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium">{file.name}</p>
						<p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
					</div>
					<label htmlFor={id} className="cursor-pointer rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/5">
						Substituir
						<input id={id} type="file" accept={accept} className="sr-only" disabled={disabled} onChange={(e) => handleFiles(e.target.files)} />
					</label>
					<Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => onChange(undefined)} disabled={disabled} aria-label="Remover arquivo">
						<X aria-hidden />
					</Button>
				</div>
			) : (
				<label htmlFor={id} className="flex cursor-pointer flex-col items-center gap-1.5 px-4 py-6 text-center">
					<Icon aria-hidden className="size-5 text-muted-foreground" />
					<span className="text-sm font-medium">Clique ou arraste o arquivo aqui</span>
					<span className="text-xs text-muted-foreground">{hint}</span>
					<input id={id} type="file" accept={accept} className="sr-only" disabled={disabled} aria-invalid={invalid} onChange={(e) => handleFiles(e.target.files)} />
				</label>
			)}
		</fieldset>
	)
}
