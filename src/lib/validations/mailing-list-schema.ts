import { z } from "zod"

export const mailingListFormSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),

  phone_number: z
    .string()
    .min(1, "O telefone é obrigatório")
    .transform((val) => val.replace(/\D/g, ""))
    .refine(
      (val) => val.length >= 10 && val.length <= 11,
      "Telefone deve ter 10 ou 11 dígitos"
    ),

  postal_code: z
    .string()
    .min(1, "O CEP é obrigatório")
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 8, "CEP deve ter 8 dígitos"),

  street: z.string().min(1, "A rua é obrigatória"),
  number: z.string().min(1, "O número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "O bairro é obrigatório"),
  city: z.string().min(1, "A cidade é obrigatória"),
  state: z.string().min(2, "O estado é obrigatório")
})

export type MailingListFormValues = z.infer<typeof mailingListFormSchema>
