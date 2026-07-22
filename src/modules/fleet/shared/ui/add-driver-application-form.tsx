// @/modules/fleet/shared/ui/add-driver-application-form.tsx

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Car, FileText, Hash, IdCard, Palette, Tag, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId, useMemo } from "react"
import { Controller, type Resolver, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { addDriverApplicationAction } from "@/modules/fleet/server/actions/add-driver-application.action"
import { DRIVER_DOCUMENT_MIME_TYPES } from "@/modules/fleet/shared/constants/driver-document"
import { VEHICLE_TYPE_LABELS, VEHICLE_TYPES } from "@/modules/fleet/shared/constants/vehicle-type"
import type { GetAddDriverApplicationContextActionData } from "@/modules/fleet/shared/types/slices/get-add-driver-application-context.types"
import { DriverDocumentDropzone } from "@/modules/fleet/shared/ui/driver-document-dropzone"
import { VehiclePreviewCard } from "@/modules/fleet/shared/ui/vehicle-preview-card"
import { type AddDriverApplicationSchemaData, addDriverApplicationSchema } from "@/modules/fleet/shared/validations/slices/add-driver-application.schema"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Combobox } from "@/shared/components/ui/combobox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/shared/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/shared/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"

type DriverCandidate = GetAddDriverApplicationContextActionData["candidates"][number]

type AddDriverApplicationFormProps = {
	candidates: DriverCandidate[]
}

const DOCUMENT_ACCEPT = DRIVER_DOCUMENT_MIME_TYPES.join(",")
const DOCUMENT_HINT = "PDF, JPG, PNG ou WEBP · máx. 10 MB"

const STATUS_SUFFIX: Record<DriverCandidate["status"], string> = {
	available: "",
	already_driver: " — já é motorista",
	pending: " — candidatura pendente"
}

export const AddDriverApplicationForm = ({ candidates }: AddDriverApplicationFormProps) => {
	const baseId = useId()
	const formId = `${baseId}-add-driver-application-form`
	const candidateId = `${baseId}-candidate`
	const plateId = `${baseId}-plate`
	const vehicleTypeId = `${baseId}-vehicle-type`
	const vehicleModelId = `${baseId}-vehicle-model`
	const vehicleYearId = `${baseId}-vehicle-year`
	const vehicleColorId = `${baseId}-vehicle-color`
	const crlvId = `${baseId}-crlv`
	const cnhId = `${baseId}-cnh`

	const router = useRouter()

	const candidateItems = useMemo(
		() =>
			candidates.map((candidate) => ({
				value: candidate.userId,
				label: `${candidate.name} (@${candidate.username})${STATUS_SUFFIX[candidate.status]}`,
				disabled: candidate.status !== "available"
			})),
		[candidates]
	)

	const form = useForm<AddDriverApplicationSchemaData>({
		// zodResolver infere o tipo de INPUT do schema; como os campos usam
		// coerce/preprocess/transform, o input diverge do output. Fixamos no output.
		resolver: zodResolver(addDriverApplicationSchema) as unknown as Resolver<AddDriverApplicationSchemaData>,
		defaultValues: {
			candidateUserId: "",
			plate: "",
			vehicleType: undefined,
			vehicleModel: "",
			vehicleYear: undefined,
			vehicleColor: "",
			crlv: undefined,
			cnh: undefined
		}
	})

	const { control, handleSubmit, formState, reset, setError } = form

	const previewPlate = useWatch({ control, name: "plate" })
	const previewVehicleType = useWatch({ control, name: "vehicleType" })
	const previewModel = useWatch({ control, name: "vehicleModel" })
	const previewYear = useWatch({ control, name: "vehicleYear" })
	const previewColor = useWatch({ control, name: "vehicleColor" })

	async function onSubmit(data: AddDriverApplicationSchemaData) {
		try {
			const result = await addDriverApplicationAction({
				candidateUserId: data.candidateUserId,
				plate: data.plate,
				vehicleType: data.vehicleType,
				vehicleModel: data.vehicleModel,
				vehicleYear: data.vehicleYear,
				vehicleColor: data.vehicleColor,
				crlv: data.crlv,
				cnh: data.cnh
			})

			if (result.success) {
				toast.success("Candidatura adicionada com sucesso!", {
					description: result.message
				})
				reset()
				router.push("/dashboard/config/fleet")
				return
			}

			switch (result.code) {
				case "unauthenticated": {
					router.replace("/")
					return
				}

				case "org_not_found": {
					router.replace("/tenant-not-found")
					return
				}

				case "plate_taken": {
					setError("plate", { type: "server", message: result.message })
					return
				}

				case "candidate_not_member":
				case "pending_application_exists": {
					setError("candidateUserId", { type: "server", message: result.message })
					return
				}

				default: {
					toast.error("Não foi possível adicionar a candidatura", {
						description: result.message
					})
				}
			}
		} catch (error) {
			console.error("[addDriverApplicationAction] erro inesperado:", error)
			toast.error("Erro inesperado", {
				description: error instanceof Error ? error.message : "Tente novamente em alguns instantes."
			})
		}
	}

	return (
		<Card className="mx-auto w-full max-w-5xl">
			<CardContent>
				<form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					<FieldSet>
						<FieldLegend>Candidato</FieldLegend>
						<FieldGroup>
							<Controller
								name="candidateUserId"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={candidateId}>Candidato</FieldLabel>
										<Combobox
											items={candidateItems}
											value={field.value}
											onValueChange={field.onChange}
											placeholder="Selecione um usuário"
											searchPlaceholder="Buscar por nome ou username..."
											emptyMessage="Nenhum usuário encontrado."
										/>
										<FieldDescription>Apenas contas já existentes na organização. Quem já é motorista ou tem candidatura pendente aparece indisponível.</FieldDescription>
										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</Field>
								)}
							/>
						</FieldGroup>
					</FieldSet>

					<FieldSeparator />

					<FieldSet>
						<FieldLegend>Veículo</FieldLegend>

						<div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_18rem] lg:items-start lg:gap-6">
							<VehiclePreviewCard plate={previewPlate} vehicleType={previewVehicleType} model={previewModel} year={previewYear} color={previewColor} className="lg:order-2" />

							<FieldGroup className="lg:order-1">
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<Controller
										name="plate"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={plateId}>Placa</FieldLabel>
												<InputGroup>
													<InputGroupAddon align="inline-start">
														<InputGroupText>
															<Car className="h-4 w-4" />
														</InputGroupText>
													</InputGroupAddon>
													<InputGroupInput {...field} id={plateId} placeholder="ABC1D23" aria-invalid={fieldState.invalid} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
												</InputGroup>
												<FieldDescription>Formato Mercosul (ABC1D23) ou antigo (ABC1234).</FieldDescription>
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>

									<Controller
										name="vehicleType"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={vehicleTypeId}>Tipo de veículo</FieldLabel>
												<Select onValueChange={field.onChange} value={field.value ?? ""}>
													<SelectTrigger id={vehicleTypeId} aria-invalid={fieldState.invalid}>
														<SelectValue placeholder="Selecione o tipo" />
													</SelectTrigger>
													<SelectContent>
														{VEHICLE_TYPES.map((type) => (
															<SelectItem key={type} value={type}>
																{VEHICLE_TYPE_LABELS[type]}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
									<Controller
										name="vehicleModel"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={vehicleModelId}>Modelo (Opcional)</FieldLabel>
												<InputGroup>
													<InputGroupAddon align="inline-start">
														<InputGroupText>
															<Tag className="h-4 w-4" />
														</InputGroupText>
													</InputGroupAddon>
													<InputGroupInput {...field} value={field.value ?? ""} id={vehicleModelId} placeholder="Fiat Strada" aria-invalid={fieldState.invalid} />
												</InputGroup>
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>

									<Controller
										name="vehicleYear"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={vehicleYearId}>Ano (Opcional)</FieldLabel>
												<InputGroup>
													<InputGroupAddon align="inline-start">
														<InputGroupText>
															<Hash className="h-4 w-4" />
														</InputGroupText>
													</InputGroupAddon>
													<InputGroupInput
														id={vehicleYearId}
														inputMode="numeric"
														placeholder="2022"
														aria-invalid={fieldState.invalid}
														value={field.value ?? ""}
														onChange={(e) => {
															const digits = e.target.value.replace(/\D/g, "")
															field.onChange(digits === "" ? undefined : Number(digits))
														}}
													/>
												</InputGroup>
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>

									<Controller
										name="vehicleColor"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={vehicleColorId}>Cor (Opcional)</FieldLabel>
												<InputGroup>
													<InputGroupAddon align="inline-start">
														<InputGroupText>
															<Palette className="h-4 w-4" />
														</InputGroupText>
													</InputGroupAddon>
													<InputGroupInput {...field} value={field.value ?? ""} id={vehicleColorId} placeholder="Branco" aria-invalid={fieldState.invalid} />
												</InputGroup>
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
								</div>
							</FieldGroup>
						</div>
					</FieldSet>

					<FieldSeparator />

					<FieldSet>
						<FieldLegend>Documentos</FieldLegend>
						<FieldGroup>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<Controller
									name="crlv"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={crlvId}>
												<FileText className="mr-2 h-4 w-4" /> CRLV do veículo
											</FieldLabel>
											<DriverDocumentDropzone id={crlvId} file={field.value} onChange={field.onChange} accept={DOCUMENT_ACCEPT} icon={FileText} hint={DOCUMENT_HINT} invalid={fieldState.invalid} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>

								<Controller
									name="cnh"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={cnhId}>
												<IdCard className="mr-2 h-4 w-4" /> CNH do motorista
											</FieldLabel>
											<DriverDocumentDropzone id={cnhId} file={field.value} onChange={field.onChange} accept={DOCUMENT_ACCEPT} icon={IdCard} hint={DOCUMENT_HINT} invalid={fieldState.invalid} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
							</div>
						</FieldGroup>
					</FieldSet>

					<div className="flex justify-end">
						<Button type="submit" form={formId} disabled={formState.isSubmitting}>
							<UserPlus className="mr-2 h-4 w-4" />
							{formState.isSubmitting ? "Enviando..." : "Adicionar candidatura"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}
