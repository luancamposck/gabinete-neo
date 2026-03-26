// @/modules/organizations/shared/ui/edit-organization-image-form.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ImageUp, Loader2, Trash2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { cn } from "@/lib/utils/cn"
import { deleteOrganizationOgImageAction } from "@/modules/organizations/server/slices/delete-organization-og-image/actions/delete-organization-og-image.action"
import { uploadOrganizationOgImageAction } from "@/modules/organizations/server/slices/upload-organization-og-image/actions/upload-organization-og-image.action"
import { useOrganizationConfig } from "@/modules/organizations/shared/ui/organization-config.context"
import { MAX_ORGANIZATION_OG_IMAGE_SIZE_BYTES, ORGANIZATION_OG_IMAGE_MIME_TYPES, uploadOrganizationOgImageSchema } from "@/modules/organizations/shared/validations/upload-organization-og-image.schema"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError } from "@/shared/components/ui/field"

type UploadOrganizationOgImageFormValues = z.infer<typeof uploadOrganizationOgImageSchema>

const OG_IMAGE_HELP_TEXT = "Essa imagem aparece quando alguém compartilha um link da sua organização (prévia/Open Graph)."
const OG_IMAGE_CONSTRAINTS_TEXT = `Formatos aceitos: JPG, PNG ou WEBP. Tamanho máximo: ${(MAX_ORGANIZATION_OG_IMAGE_SIZE_BYTES / 1024 / 1024).toFixed(0)} MB.`

export const EditOrganizationImageForm = ({ defaultImageUrl }: { defaultImageUrl: string | null }) => {
	const router = useRouter()
	const { setImageUrl } = useOrganizationConfig()

	const baseId = useId()
	const fileInputId = `${baseId}-organization-og-image`
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const [isDragOver, setIsDragOver] = useState(false)
	const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(defaultImageUrl)
	const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl)
	const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const form = useForm<UploadOrganizationOgImageFormValues>({
		resolver: zodResolver(uploadOrganizationOgImageSchema)
	})

	const { control, handleSubmit, formState, resetField, trigger } = form
	const isSubmitting = formState.isSubmitting
	const isBusy = isSubmitting || isDeleting

	const selectedFile = useWatch({ control, name: "file" })

	useEffect(() => {
		setCurrentImageUrl(defaultImageUrl)
	}, [defaultImageUrl])

	useEffect(() => {
		setIsDragOver(false)
		setPreviewSize(null)

		const fileUrl = selectedFile ? URL.createObjectURL(selectedFile) : null
		const nextUrl = fileUrl ?? currentImageUrl ?? null
		setPreviewUrl(nextUrl)

		if (!nextUrl) {
			return () => {
				if (fileUrl) {
					URL.revokeObjectURL(fileUrl)
				}
			}
		}

		let isActive = true

		const img = new window.Image()
		img.onload = () => {
			if (!isActive) return
			setPreviewSize({
				width: img.naturalWidth,
				height: img.naturalHeight
			})
		}
		img.onerror = () => {
			if (!isActive) return
			setPreviewSize(null)
		}
		img.src = nextUrl

		return () => {
			isActive = false
			if (fileUrl) {
				URL.revokeObjectURL(fileUrl)
			}
		}
	}, [selectedFile, currentImageUrl])

	useEffect(() => {
		setImageUrl(previewUrl ?? null)
	}, [previewUrl, setImageUrl])

	const submit = handleSubmit(onSubmit)

	function openFileDialog() {
		fileInputRef.current?.click()
	}

	function handleHeaderActionClick(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault()
		if (isBusy) return

		// First click: pick an image. Second click (with a file selected): upload.
		if (!selectedFile) {
			openFileDialog()
			return
		}

		submit()
	}

	function handleCancelEdit() {
		if (isBusy) return
		clearSelectedFile()
	}

	async function handleDeleteImage() {
		if (isBusy) return
		setIsDeleting(true)

		try {
			const res = await deleteOrganizationOgImageAction()

			if (res.success === false) {
				switch (res.code) {
					case "unauthenticated": {
						router.replace("/")
						return
					}

					case "org_not_found": {
						router.replace("/tenant-not-found")
						return
					}

					case "not_allowed": {
						toast.error("Você não tem permissão para isso.", {
							description: res.message
						})
						return
					}

					default: {
						// deixa o error boundary do /dashboard lidar
						throw new Error(res.message)
					}
				}
			}

			setCurrentImageUrl(null)
			setImageUrl(null)
			clearSelectedFile()
			toast.success("Imagem removida.", {
				description: res.message
			})
		} finally {
			setIsDeleting(false)
		}
	}

	function handleDropzoneDragOver(e: React.DragEvent<HTMLButtonElement>) {
		e.preventDefault()
		if (isBusy) return
		e.dataTransfer.dropEffect = "copy"
		setIsDragOver(true)
	}

	function handleDropzoneDragLeave(e: React.DragEvent<HTMLButtonElement>) {
		e.preventDefault()
		if (isBusy) {
			setIsDragOver(false)
			return
		}
		setIsDragOver(false)
	}

	function clearSelectedFile() {
		resetField("file")
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	async function onSubmit(data: UploadOrganizationOgImageFormValues) {
		const formData = new FormData()
		formData.set("file", data.file)

		const res = await uploadOrganizationOgImageAction(formData)

		if (res.success === false) {
			setImageUrl(defaultImageUrl)
			setCurrentImageUrl(defaultImageUrl)
			switch (res.code) {
				case "unauthenticated": {
					router.replace("/")
					return
				}

				case "org_not_found": {
					router.replace("/tenant-not-found")
					return
				}

				case "not_allowed": {
					clearSelectedFile()
					toast.error("Você não tem permissão para isso.", {
						description: res.message
					})
					return
				}

				case "invalid_file": {
					clearSelectedFile()
					toast.error("Arquivo inválido.", {
						description: res.message
					})
					return
				}

				default: {
					// deixa o error boundary do /dashboard lidar
					throw new Error(res.message)
				}
			}
		}

		setCurrentImageUrl((prev) => res.data.imageUrl ?? prev ?? defaultImageUrl)
		setImageUrl(res.data.imageUrl ?? defaultImageUrl)
		clearSelectedFile()
		toast.success("Imagem enviada.", {
			description: res.message
		})
	}

	const accept = ORGANIZATION_OG_IMAGE_MIME_TYPES.join(",")
	const isEditing = Boolean(selectedFile)

	return (
		<section className="space-y-4">
			<div className="rounded-lg border bg-card p-4 shadow-sm">
				<div className="flex flex-col md:flex-row justify-center items-center md:justify-between gap-2">
					<div className="flex flex-col md:flex-row items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
							<ImageUp className="h-4 w-4 text-primary" />
						</div>
						<div>
							<div className="text-sm font-semibold">Imagem de compartilhamento</div>
							<div className="text-xs text-muted-foreground">A imagem que aparece na prévia quando você compartilha um link.</div>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button type="button" variant="ghost" size="icon" aria-label={isSubmitting ? "Enviando imagem" : selectedFile ? "Enviar imagem" : "Escolher imagem"} onClick={handleHeaderActionClick} disabled={isBusy}>
							<span className="relative inline-flex h-4 w-4 items-center justify-center">
								{isSubmitting ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<>
										<Upload className={cn("absolute h-4 w-4 transition-all duration-200", selectedFile ? "scale-90 opacity-0" : "scale-100 opacity-100")} />
										<Check className={cn("absolute h-4 w-4 transition-all duration-200", selectedFile ? "scale-100 opacity-100" : "scale-90 opacity-0")} />
									</>
								)}
							</span>
						</Button>
						{isEditing ? (
							<Button type="button" variant="ghost" size="icon" aria-label="Cancelar edição da imagem" onClick={handleCancelEdit} disabled={isBusy}>
								<X className="h-4 w-4" />
							</Button>
						) : (
							<Button type="button" variant="destructive" size="icon" aria-label="Excluir imagem" onClick={handleDeleteImage} disabled={isBusy}>
								<Trash2 className="h-4 w-4 " />
							</Button>
						)}
					</div>
				</div>

				<div className="mt-4 space-y-4 text-sm">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<Controller
							name="file"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid} className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide flex items-center gap-2">
										<ImageUp className="h-3.5 w-3.5" />
										Imagem (Open Graph)
									</div>

									<input
										ref={fileInputRef}
										id={fileInputId}
										type="file"
										accept={accept}
										className="sr-only"
										disabled={isBusy}
										onChange={(e) => {
											const file = e.target.files?.item(0) ?? undefined
											field.onChange(file)
											void trigger("file")
										}}
									/>

									<button
										type="button"
										aria-label="Arraste e solte aqui ou escolha uma imagem do seu dispositivo."
										aria-invalid={fieldState.invalid}
										disabled={isBusy}
										className={cn(
											"w-full cursor-pointer rounded-md border border-dashed bg-muted/60 px-4 py-6 text-center text-xs text-muted-foreground transition-colors",
											isDragOver && "border-primary bg-primary/10 text-foreground",
											fieldState.invalid && "border-destructive bg-destructive/5",
											isBusy && "cursor-not-allowed opacity-70"
										)}
										onClick={(e) => {
											e.preventDefault()
											if (isBusy) return
											openFileDialog()
										}}
										onDragOver={handleDropzoneDragOver}
										onDragLeave={handleDropzoneDragLeave}
										onDrop={(e) => {
											e.preventDefault()
											if (isBusy) {
												setIsDragOver(false)
												return
											}

											setIsDragOver(false)

											const file = e.dataTransfer.files?.item(0) ?? undefined
											field.onChange(file)
											void trigger("file")
										}}
									>
										<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-background">
											<ImageUp className="h-4 w-4 text-foreground" />
										</div>
										<p className="mt-3">
											Arraste e solte aqui ou <span className="underline underline-offset-4">escolha do seu dispositivo</span>.
										</p>

										{field.value ? (
											<p className="mt-2 text-[11px] text-muted-foreground">
												Selecionado: <span className="font-medium text-foreground">{field.value.name}</span>
											</p>
										) : (
											<p className="mt-2 text-[11px] text-muted-foreground">Nenhuma imagem selecionada</p>
										)}
									</button>

									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}

									<p className="text-xs text-muted-foreground">{OG_IMAGE_HELP_TEXT}</p>
									<p className="text-xs text-muted-foreground">{OG_IMAGE_CONSTRAINTS_TEXT}</p>
								</Field>
							)}
						/>

						{previewUrl ? (
							<div className="overflow-hidden rounded-md border bg-muted/30 p-2">
								<div className="flex justify-center">
									<Image
										src={previewUrl}
										alt="Prévia da imagem selecionada"
										width={previewSize?.width ?? 1200}
										height={previewSize?.height ?? 630}
										className="h-auto w-auto max-h-72 max-w-full rounded-md object-contain"
										unoptimized
									/>
								</div>
							</div>
						) : (
							<div className="rounded-md border border-dashed bg-muted/30 px-3 py-6 text-center text-xs text-muted-foreground">Selecione uma imagem para ver a prévia aqui.</div>
						)}
					</form>
				</div>
			</div>
		</section>
	)
}
