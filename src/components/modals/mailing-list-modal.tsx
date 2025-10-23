"use client"

import { UserPlus } from "lucide-react"

import { AddressForm } from "@/components/forms/mailing-list/mailing-list-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

export const MailingListModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          Adicionar <UserPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Cadastro de pessoas no Mala Direta</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para adicionar uma nova pessoa.
          </DialogDescription>
        </DialogHeader>
        <AddressForm />
      </DialogContent>
    </Dialog>
  )
}
