# Design Brief: Adicionar Candidatura de Motorista (`/dashboard/config/fleet/new`)

## Problem

Quem administra a organização às vezes precisa cadastrar manualmente a candidatura de um motorista — um membro que já existe na organização, mas ainda não tem veículo registrado. Hoje essa tela é um formulário de balcão: um card único, campos empilhados sem nenhuma hierarquia visual, um seletor de arquivo cru do navegador para os documentos, e nenhuma pista visual do que está sendo montado até apertar "Adicionar". A pessoa preenche no escuro, sem confirmação de que a placa/tipo/documentos fazem sentido juntos, e só descobre um erro de validação depois de tentar enviar. É rápido de construir, mas parece formulário de repartição — o oposto do resto do módulo, que já foi redesenhado para parecer um painel de controle ágil.

## Solution

Uma tela de cadastro rápida, em página única (sem wizard — são só 8 campos), organizada em blocos visuais claros: **Candidato**, **Veículo**, **Documentos**. Conforme placa/tipo/modelo são preenchidos, um cartão de pré-visualização mostra o veículo tomando forma — mesma linguagem visual (badge de tipo, placa em mono) já usada na fila de revisão, criando continuidade entre "cadastrar" e "revisar". O upload de CRLV/CNH deixa de ser um `<input type="file">` nu e vira uma zona de soltar/selecionar arquivo com nome, tamanho e opção de trocar — utilizável tanto com mouse quanto com câmera/galeria no celular. O resultado deve parecer uma continuação natural da central de triagem, não um formulário à parte.

## Experience Principles

1. **Ver antes de enviar** — a pessoa deve conseguir confirmar visualmente (placa formatada, badge do tipo, nome dos arquivos) o que está prestes a cadastrar, sem precisar reler os campos um a um.
2. **Seções, não uma pilha** — Candidato / Veículo / Documentos são etapas lógicas diferentes; o layout deve deixar isso óbvio por agrupamento e respiro, mesmo sendo uma página só.
3. **Sóbrio, não solene** — mesmo princípio do resto do módulo: institucional na tipografia e nos tokens, sem parecer formulário de repartição pública. Já testado e aprovado na tela de revisão.

## Aesthetic Direction

Herda integralmente a direção já estabelecida para o módulo fleet (ver `.design/fleet-config/DESIGN_BRIEF.md`) — mesma tela, mesmo produto, mesmo usuário.

- **Philosophy**: _Functional institutional / "quiet admin"_ — utilitário e denso onde precisa, com respiro e polimento. Superfícies neutras (shadcn new-york sobre base slate), acento sóbrio, foco no conteúdo.
- **Tone**: Calmo, confiável, eficiente.
- **Reference points**: Mesmos da revisão — Linear (densidade + estados), painéis de aprovação Stripe/Vercel, GOV.BR Design System (clareza sem peso). Para o preview vivo do veículo especificamente: formulários de checkout com resumo lateral (ex.: confirmação de pedido) — mostrar o que foi montado antes de confirmar.
- **Anti-references**: Wizard de múltiplas telas para um formulário curto; `<input type="file">` nu; qualquer coisa que pareça cadastro de sistema legado.

## Existing Patterns

- **Typography**: Geist Sans (corpo/títulos), Geist Mono (placa). Título de página: `text-2xl font-semibold tracking-tight`. Já em uso no `page.tsx` atual.
- **Colors**: Tokens OKLCH em `src/app/globals.css`, incluindo os semânticos de status (`success`/`warning`/`info`/`destructive` + `-subtle`) adicionados na revisão. Reaproveitar, não introduzir cor nova.
- **Spacing**: `--radius: 0.625rem`. Página segue `p-4 space-y-6`.
- **Components já usados no form atual**: `Card`/`CardContent`, `Field`/`FieldLabel`/`FieldDescription`/`FieldError`/`FieldGroup`/`FieldSet` (mas **não** `FieldLegend`/`FieldSeparator` — existem no design system e nunca foram usados; é a peça que falta para segmentar sem componente novo), `Combobox` (seleção de candidato), `Select` (tipo de veículo), `InputGroup`/`InputGroupAddon` (ícone + input), `react-hook-form` + `zod` via `addDriverApplicationSchema`.
- **Vocabulário visual da revisão (reaproveitar)**: `VehicleTypeBadge` e `VEHICLE_TYPE_ICONS` de `application-visuals.tsx` (ícone por tipo: carro/moto/van/caminhão), formatação de placa em mono.
- **Padrão de stepper existente**: `register-as-driver-form.tsx` tem um stepper numerado de 3 etapas — **não é o padrão a seguir aqui** (é para ~20 campos de um cadastro público; aqui são 8 campos de um admin autenticado). Mantém-se como está, fora de escopo.
- **Restrições de documento**: `DRIVER_DOCUMENT_MIME_TYPES` (PDF/JPG/PNG/WEBP), `MAX_DRIVER_DOCUMENT_SIZE_BYTES` (10 MB) — regras de validação não mudam, só a UI de upload.

## Component Inventory

| Component | Status | Notes |
| --- | --- | --- |
| `Field`, `FieldGroup`, `FieldSet` | Exists | Mantidos como estrutura base dos campos. |
| `FieldLegend`, `FieldSeparator` | Exists (não usado) | Adotar para os títulos das 3 seções (Candidato / Veículo / Documentos). |
| `Combobox`, `Select`, `InputGroup` | Exists | Reaproveitados sem alteração para candidato/placa/tipo/modelo/ano/cor. |
| `VehicleTypeBadge`, `VEHICLE_TYPE_ICONS` | Exists (`applications/application-visuals.tsx`) | Reaproveitado no card de preview do veículo. |
| `VehiclePreviewCard` | New | Card lateral/superior que mostra placa formatada + badge de tipo + modelo/ano/cor conforme preenchidos; estado vazio quando nada foi digitado ainda. |
| `DriverDocumentDropzone` | New | Substitui o `<input type="file">` nas duas ocasiões (CRLV, CNH): área de clique/arrastar, ícone por tipo de doc, preview de nome+tamanho do arquivo selecionado, ação de trocar/remover, estado de erro (tipo/tamanho inválido) inline. |
| `AddDriverApplicationForm` | Modify | Reestrutura em 3 `FieldSet` seccionados com `FieldLegend`; integra `VehiclePreviewCard` e `DriverDocumentDropzone`; mantém toda a lógica de validação/submit existente. |
| `page.tsx` (`/fleet/new`) | Modify | Só ajustes de layout ao redor do form (ex.: grid para acomodar o preview lateral no desktop); mantém Server Component + busca de contexto como está. |

## Key Interactions

- **Selecionar candidato**: `Combobox` como já é hoje — busca por nome/username, indisponíveis (já motorista / candidatura pendente) aparecem desabilitados com o motivo no rótulo.
- **Preencher veículo**: conforme placa, tipo, modelo, ano, cor são digitados, o `VehiclePreviewCard` atualiza em tempo real (sem debounce perceptível — é local, não bate API). Placa inválida não quebra o preview, só não formata.
- **Anexar documento**: clicar ou arrastar um arquivo sobre a dropzone → valida tipo/tamanho no client antes mesmo de tentar o submit → mostra nome do arquivo + ícone de sucesso; erro de tipo/tamanho aparece inline na própria dropzone (mesmo padrão visual do `FieldError` atual). Trocar o arquivo é um clique ("Substituir"), sem precisar re-selecionar do zero visualmente perdido.
- **Enviar**: botão fica desabilitado durante submit (já existe); em erro de servidor (placa duplicada, candidato indisponível), o erro aparece no campo específico via `setError`, sem perder o preenchido — comportamento que já existe hoje e deve ser preservado.
- **Cancelar/voltar**: botão "Voltar para candidaturas" no topo, como já existe.

## Responsive Behavior

- **Mobile (< `sm`)**: uma coluna; `VehiclePreviewCard` aparece **acima** do bloco de campos do veículo (não lateral) como um resumo compacto, não empurra o form para baixo da dobra. Dropzones ocupam a largura toda, altura generosa para toque (mín. ~44px de área de toque no botão de ação).
- **Tablet/Desktop (≥ `md`/`lg`)**: campos de veículo em grid 2-3 colunas como já é hoje. `VehiclePreviewCard` pode virar uma coluna lateral fixa (sticky) ao lado do form em telas largas (≥ `lg`), acompanhando o scroll — decisão de refinamento na fase de implementação, não bloqueante.
- Nenhum componente muda de **comportamento** entre breakpoints aqui (diferente da tela de revisão) — só de posição/tamanho.

## Accessibility Requirements

- **Contraste**: mesmo mínimo AA já vigente no módulo (4.5:1 texto normal, 3:1 ícones/UI grandes).
- **Teclado**: dropzone de documento deve ser operável via teclado (botão real por trás, `input[type=file]` acessível mesmo com a área customizada — não pode depender só de drag-and-drop do mouse).
- **Leitor de tela**: dropzone anuncia estado (vazio → arquivo selecionado → erro) via `aria-live` ou `role="status"`; nome do arquivo selecionado exposto como texto, não só visual.
- **Erros**: mantém o padrão já usado (`FieldError` com `role="alert"`) para validação de campo e de documento.
- **Movimento**: qualquer transição no preview/dropzone respeita `prefers-reduced-motion`.

## Out of Scope

- Qualquer mudança em **validação, actions, services, use-cases ou schema** (`addDriverApplicationSchema`, `add-driver-application.action.ts`) — só a camada visual do form muda.
- O **stepper de `register-as-driver-form.tsx`** (cadastro público de motorista) — fica como está.
- Upload real para storage / lógica de submit — a `DriverDocumentDropzone` é só a camada de seleção/preview client-side; o envio continua via `FormData` como hoje.
- Paginação ou busca assíncrona no `Combobox` de candidato — lista já vem inteira do context action.
- Qualquer alteração na tela de revisão (`/dashboard/config/fleet`) — já coberta pelo brief anterior.
