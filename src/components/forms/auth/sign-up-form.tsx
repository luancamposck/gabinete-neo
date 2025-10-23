"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import Link from "next/link"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { signUp } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { signUpSchema } from "@/lib/definitions/sign-up-schema"
import { cn } from "@/lib/utils"

type SignUpFormProps = React.ComponentProps<"div">
type SignUpFormValues = z.infer<typeof signUpSchema>

export const SignUpForm = ({ className, ...props }: SignUpFormProps) => {
  const [isPending, startTransition] = useTransition()

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = (values: SignUpFormValues) => {
    startTransition(() => {
      signUp(values)
        .then((response) => {
          if (!response.success) {
            toast.error(response.message)
            return
          }

          toast.success(response.message)
          form.reset()
        })
        .catch(() => {
          toast.error("Não foi possível conectar ao servidor")
        })
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-3">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 md:p-8"
              noValidate
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-2xl font-bold">Crie sua conta</h2>
                  <p className="text-muted-foreground text-balance">
                    Cadastre-se para acessar o Gabinete NEO
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="m@example.com"
                          type="email"
                          autoComplete="email"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123.456.789-10"
                          autoComplete="cpf"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Senha</FormLabel>
                        <Link
                          href="#"
                          className="ml-auto text-sm underline-offset-2 hover:underline"
                        >
                          Precisa de ajuda?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Cadastrando..." : "Cadastrar"}
                </Button>
                <div className="text-center text-sm">
                  Já possui uma conta?{" "}
                  <Link href="#" className="underline underline-offset-4">
                    Faça login
                  </Link>
                </div>
              </div>
            </form>
          </Form>
          <div className="bg-muted hidden md:flex md:flex-col md:justify-center md:items-center">
            <Image
              src="/logo.png"
              width={300}
              height={300}
              alt="Gabinete NEO"
            />
            <h2 className="text-3xl font-semibold text-center">Gabinete NEO</h2>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Ao continuar, você concorda com nossos{" "}
        <Link href="#">Termos de Serviço</Link> e{" "}
        <Link href="#">Política de Privacidade</Link>.
      </div>
    </div>
  )
}
