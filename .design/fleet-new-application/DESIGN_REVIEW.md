# Design Review: Adicionar Candidatura de Motorista (`/dashboard/config/fleet/new`)

Reviewed against: `.design/fleet-new-application/DESIGN_BRIEF.md`
Philosophy: Functional institutional / "quiet admin"
Date: 2026-07-22

## Screenshots Captured

Playwright indisponível neste ambiente (Chromium não instalado, sem sudo). Revisão feita sobre **1 screenshot fornecida pelo usuário no chat** — dark mode, desktop largo (~1920px), estado preenchido (candidato selecionado, veículo e os dois documentos anexados).

**Não verificado nesta rodada**: light mode, tablet (768px), mobile (375px), estados vazio/erro/carregando. Recomendo captura adicional antes de considerar a tela pronta, especialmente mobile — é o breakpoint em que `VehiclePreviewCard` muda de posição (inline vs. sidebar) e onde o brief exige uso diário rápido.

## Summary

A estrutura seccionada (Candidato/Veículo/Documentos + `FieldLegend`/`FieldSeparator`), o preview vivo do veículo e as dropzones de documento funcionam e batem com o brief — a tela já não parece mais um formulário genérico. O problema mais sério é um bug de layout que eu introduzi ao dividir o card em grid de 2 colunas: o botão de submit ficou desalinhado do formulário, flutuando sob a coluna vazia do preview. Os outros 3 pontos são de composição/polimento, não de funcionalidade.

## Must Fix

1. **Botão "Adicionar candidatura" desalinhado do formulário** — [add-driver-application-form.tsx:342-347](../../src/modules/fleet/shared/ui/add-driver-application-form.tsx#L342-L347). A `<div className="flex justify-end">` do botão é irmã do wrapper `lg:grid lg:grid-cols-[1fr_18rem]`, não filha da coluna do form. Como `justify-end` resolve contra a largura total do Card (form + sidebar), o botão fica alinhado à direita do card inteiro — sob a coluna vazia do preview, não sob os campos de Documentos que ele envia. Confirmado na screenshot: o botão termina bem à direita do dropzone de CNH, alinhado com o card de pré-visualização acima. Isso quebra a hierarquia visual do CTA principal — a ação mais importante da tela parece desconectada do que ela faz.
   _Fix: mover a `<div className="flex justify-end">` do botão para dentro da `<div className="space-y-8">` (coluna do form), como último item, depois do `FieldSet` de Documentos. Assim `justify-end` resolve só contra a largura da coluna `1fr`._

## Should Fix

2. **Card do formulário cola na esquerda, com grande vazio decorativo à direita em telas largas** — [add-driver-application-form.tsx:147](../../src/modules/fleet/shared/ui/add-driver-application-form.tsx#L147). `max-w-5xl` sem `mx-auto` (nem no Card nem no wrapper de `page.tsx`) deixa o form ancorado no canto esquerdo com o fundo decorativo do shell preenchendo o resto — quebra o equilíbrio "sóbrio, institucional" do brief; a tela parece perdida no espaço em vez de composta. Esse comportamento já existia no form antigo (`max-w-3xl` também sem centralização), mas ficou mais visível agora que a largura aumentou para acomodar o preview.
   _Fix: `<Card className="w-full max-w-5xl mx-auto">`. Nenhum token novo — é o mesmo padrão de container centralizado já usado em outras telas de config._

3. **Grid de Modelo/Ano/Cor no preview quebra em nomes de modelo mais longos** — [vehicle-preview-card.tsx:38-42](../../src/modules/fleet/shared/ui/vehicle-preview-card.tsx#L38-L42). O `dl` usa `grid-cols-3` dentro de um card de só `18rem`; sobra pouco mais de 70px por coluna. Na screenshot, "Uno com Escada" quebra em duas linhas enquanto Ano e Cor ficam numa só — o mini-resumo fica com altura desbalanceada e a leitura perde o ritmo que o resto da tela tem.
   _Fix: trocar para `grid-cols-2` com Modelo ocupando a linha inteira (`col-span-2`) e Ano/Cor dividindo a linha abaixo — Modelo é sistematicamente o campo mais longo (nome de veículo) contra dois campos curtos (ano numérico, cor em geral uma palavra), então não faz sentido tratá-los como iguais na grade._

## Could Improve

1. **Ícone duplicado entre Placa e Modelo** — [add-driver-application-form.tsx:195](../../src/modules/fleet/shared/ui/add-driver-application-form.tsx#L195) e [:243](../../src/modules/fleet/shared/ui/add-driver-application-form.tsx#L243). Os dois campos usam o mesmo ícone `Car` no `InputGroupAddon` — confirmado na screenshot, o mesmo ícone aparece antes de "ABC2D23" e antes de "Uno com Escada". Não é um bug (o campo Placa já carrega o significado "veículo" por si só; Modelo não precisava reforçar com o mesmo ícone), mas reduz a utilidade do ícone como identificador rápido de campo. Pré-existente no form antigo, não introduzido nesta revisão.
   _Suggestion: trocar o ícone de Modelo para `Tag` (já disponível via `lucide-react`, sem dependência nova) — diferencia visualmente "identificação do veículo" (placa) de "descrição do veículo" (modelo)._

## What Works Well

- **Estrutura seccionada com `FieldLegend`/`FieldSeparator`** cumpre exatamente o que o brief pedia: as 3 seções (Candidato/Veículo/Documentos) são visualmente óbvias sem parecer um wizard — a tela lê como um formulário organizado, não como uma pilha.
- **`VehiclePreviewCard`** funciona corretamente e em tempo real: placa em mono, badge de tipo (`Van`) e os 3 campos secundários refletem exatamente o que foi digitado, sem lag perceptível na screenshot. A reutilização do `VehicleTypeBadge` da tela de revisão dá a continuidade visual entre as duas telas que o brief pedia.
- **`DriverDocumentDropzone`** no estado preenchido é limpo e informativo — nome do arquivo, tamanho, ícone consistente com o tipo de documento (FileText para CRLV, IdCard para CNH), ações de trocar/remover claras. Grande melhora sobre o `<input type="file">` cru anterior.
