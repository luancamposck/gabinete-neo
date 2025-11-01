"use client"

import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Layers,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Users
} from "lucide-react"
import { motion, type Variants } from "motion/react"
import Image from "next/image"
import { ModeToggleButton } from "@/components/mode-toggle-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      type: "tween",
      ease: "easeOut"
    }
  }
}

const fadeInOnScroll: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      type: "tween",
      ease: "easeOut"
    }
  }
}

const heroBenefits = [
  { icon: ShieldCheck, label: "Segurança de nível corporativo" },
  { icon: Layers, label: "Multi-tenant para múltiplas campanhas" },
  { icon: Smartphone, label: "Experiência fluida em qualquer dispositivo" }
]

const featureCards = [
  {
    icon: BarChart3,
    title: "Comando Central",
    description:
      "Veja o panorama completo da sua campanha em tempo real. Metas, engajamento, arrecadação e presença digital — tudo em um só painel."
  },
  {
    icon: Users,
    title: "Mobilização Inteligente",
    description:
      "Organize voluntários, acompanhe atividades e gamifique o engajamento. Transforme apoiadores em agentes ativos de conquista de votos."
  },
  {
    icon: Sparkles,
    title: "Insights Eleitorais com IA",
    description:
      "Acompanhe tendências, descubra oportunidades e antecipe cenários com análises preditivas criadas especialmente para campanhas políticas."
  },
  {
    icon: Layers,
    title: "Gestão de Recursos e Transparência",
    description:
      "Controle cada centavo investido e arrecadado, com relatórios automáticos, gráficos e auditoria completa de compliance."
  },
  {
    icon: Smartphone,
    title: "Conexão Cidadã",
    description:
      "Crie um canal direto com a população. Compartilhe propostas, receba opiniões e mostre resultados de forma transparente e interativa."
  }
]

const securityCards = [
  {
    icon: ShieldCheck,
    title: "Transparência Total",
    description:
      "Cada doação, gasto e votação é registrada automaticamente, gerando trilhas de auditoria seguras e acessíveis."
  },
  {
    icon: BadgeCheck,
    title: "Infraestrutura Blindada",
    description:
      "Hospedagem em nuvem com criptografia avançada, autenticação em múltiplos fatores e monitoramento 24/7."
  },
  {
    icon: Layers,
    title: "Backup Inteligente",
    description:
      "Todos os dados são replicados e armazenados com redundância geográfica — zero risco de perda ou interrupção."
  },
  {
    icon: Target,
    title: "Compliance Político",
    description:
      "Estruturado segundo normas da LGPD e boas práticas internacionais de segurança digital (ISO 27001 e SOC 2)."
  }
]

const CTA_PRIMARY_LABEL = "Quero testar agora →"
const CTA_SECONDARY_LABEL = "Ver planos e demonstrações"

const LpPage = () => {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Gabinete Neo"
              width={36}
              height={36}
              className="rounded-md"
            />
            <span className="text-lg font-semibold">Gabinete Neo</span>
          </div>

          <nav className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Login de Clientes
            </Button>
            <Button size="sm" className="hidden sm:inline-flex">
              Teste Gratuitamente
            </Button>
            <ModeToggleButton />
          </nav>
        </div>
      </header>

      <main className="relative overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)]" />

        <motion.section
          id="hero"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-24 pt-20 text-center sm:px-8 lg:pb-32 lg:pt-28"
        >
          <motion.div
            className="mb-6 flex items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 py-2 text-sm font-medium text-primary max-w-full"
            aria-label="Plataforma Inteligente de Gestão Política"
          >
            <Badge className="border-none p-0 bg-transparent text-sm md:text-base shadow-none ">
              <span className="mr-2 text-md md:text-lg" role="img" aria-hidden>
                🚀
              </span>
              Plataforma Inteligente de Gestão Política
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Conduza sua campanha com tecnologia, estratégia e inteligência
            artificial
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-3xl text-balance text-lg text-muted-foreground sm:text-xl"
          >
            Tudo o que você precisa para planejar, engajar e vencer — gerencie
            equipes, coordene votações e tome decisões baseadas em dados.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            aria-label="Ações principais"
          >
            <Button size="lg" className="shadow-lg shadow-primary/30">
              Teste o Gabinete Neo Gratuitamente
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              Agendar Demonstração Personalizada
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </motion.div>

          <motion.ul
            variants={fadeInUp}
            className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-3"
          >
            {heroBenefits.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 px-4 py-3 text-sm font-medium text-muted-foreground backdrop-blur"
              >
                <Icon className="size-5 text-primary" aria-hidden />
                <span>{label}</span>
              </li>
            ))}
          </motion.ul>
        </motion.section>

        <motion.section
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInOnScroll}
          className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8"
        >
          <div className="text-center">
            <BadgeCheck
              className="mx-auto mb-4 size-6 text-primary"
              aria-hidden
            />
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Ferramentas poderosas para campanhas que querem vencer
            </h2>
            <p className="mt-4 max-w-3xl text-balance text-base text-muted-foreground sm:text-lg sm:mx-auto">
              Centralize todas as operações da sua campanha em uma plataforma
              única — simples de usar, robusta por dentro e turbinada por IA.
            </p>
          </div>

          <motion.div
            className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {featureCards.map((feature) => (
              <motion.div key={feature.title} variants={fadeInOnScroll}>
                <Card className="h-full border-border/70 bg-card/80 backdrop-blur">
                  <CardHeader className="px-6 py-6">
                    <div className="mb-3 flex items-center gap-2">
                      <feature.icon
                        className="size-5 text-primary"
                        aria-hidden
                      />
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          id="demo"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInOnScroll}
          className="mx-auto w-full max-w-5xl rounded-3xl border border-border/70 bg-gradient-to-br from-background/60 via-background/30 to-primary/10 px-6 py-20 text-center shadow-xl backdrop-blur sm:px-16"
        >
          <motion.div variants={fadeInOnScroll}>
            <div className="flex items-center justify-center gap-3 text-primary">
              <Play className="size-6" aria-hidden />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Demonstração Interativa
              </span>
            </div>
            <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Veja como é fácil transformar sua campanha com o Gabinete Neo
            </h2>
            <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
              Conheça o fluxo completo de gestão de uma campanha política
              digital — do planejamento à vitória nas urnas. A demonstração
              guiada mostra como cada módulo do Gabinete Neo simplifica decisões
              e multiplica resultados.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInOnScroll}
            className="mt-10 flex justify-center"
          >
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/30">
              <span role="img" aria-hidden>
                ▶️
              </span>
              Iniciar Demonstração Interativa
            </Button>
          </motion.div>

          <motion.p
            variants={fadeInOnScroll}
            className="mt-6 text-sm text-muted-foreground"
          >
            Duração: 5 minutos • 100% online • Simulação com dados reais de
            campanha
          </motion.p>
        </motion.section>

        <motion.section
          id="security"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInOnScroll}
          className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8"
        >
          <div className="text-center">
            <ShieldCheck
              className="mx-auto mb-4 size-6 text-primary"
              aria-hidden
            />
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Confiança e segurança no mesmo nível de instituições financeiras
            </h2>
            <p className="mt-4 max-w-3xl text-balance text-base text-muted-foreground sm:text-lg sm:mx-auto">
              Seus dados, sua campanha e sua reputação política protegidos com
              padrões de segurança corporativa — do login ao armazenamento.
            </p>
          </div>

          <motion.div
            className="mt-12 grid gap-6 md:grid-cols-2"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {securityCards.map((item) => (
              <motion.div key={item.title} variants={fadeInOnScroll}>
                <Card className="h-full border-border/70 bg-card/80 backdrop-blur">
                  <CardHeader className="px-6 py-6">
                    <div className="mb-3 flex items-center gap-2">
                      <item.icon className="size-5 text-primary" aria-hidden />
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeInOnScroll}
            className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-muted-foreground"
            aria-label="Certificações e segurança"
          >
            <div className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-2">
              <Target className="size-4 text-primary" aria-hidden />
              LGPD Ready
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-2">
              <Sparkles className="size-4 text-primary" aria-hidden />
              Criptografia End-to-End
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-2">
              <BarChart3 className="size-4 text-primary" aria-hidden />
              Certificação ISO 27001
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          id="cta"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInOnScroll}
          className="mx-auto w-full max-w-5xl px-6 pb-24 sm:px-8"
        >
          <div className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 via-background to-background px-8 py-16 text-center shadow-lg backdrop-blur sm:px-16">
            <Users className="mx-auto mb-4 size-8 text-primary" aria-hidden />
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Chegou a hora de profissionalizar sua campanha
            </h2>
            <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
              Candidatos e equipes em todo o Brasil já estão elevando suas
              campanhas a um novo patamar de eficiência, estratégia e
              transparência com o Gabinete Neo.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/30">
                {CTA_PRIMARY_LABEL}
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                {CTA_SECONDARY_LABEL}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              🚀 Em média, campanhas que usam o Gabinete Neo reduzem 40% do
              tempo operacional e aumentam o engajamento em até 3x.
            </p>
          </div>
        </motion.section>

        <motion.footer
          id="footer"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeInOnScroll}
          className="border-t border-border/60 bg-background/80 px-6 py-10 backdrop-blur sm:px-8"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Image src="/logo.png" width={36} height={36} alt={""} />
              <span>Gabinete Neo</span>
            </div>

            <nav aria-label="Navegação do rodapé">
              <ul className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {[
                  { href: "#hero", label: "Home" },
                  { href: "#features", label: "Funcionalidades" },
                  { href: "#demo", label: "Demonstração" },
                  { href: "#security", label: "Segurança" },
                  { href: "#footer", label: "Contato" }
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className={cn(
                        "transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <p className="mt-6 text-sm text-muted-foreground text-center">
            © 2025 Gabinete Neo. Plataforma SaaS para campanhas políticas
            modernas e transparentes.
          </p>
        </motion.footer>
      </main>
    </>
  )
}

export default LpPage
