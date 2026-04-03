# PRD: Surveys Module

## Introduction

Este PRD define a implementação completa e corrigida do módulo de pesquisas (`surveys`) para o gabinete-neo. O objetivo é entregar uma feature semelhante ao Google Forms, integrada ao modelo multi-tenant do produto, permitindo que um político ou membro autorizado crie, publique, gerencie e analise pesquisas, enquanto membros e/ou público respondem conforme a visibilidade da survey.

O escopo desta entrega é **end-to-end**:

1. Banco de dados e políticas de acesso
2. Server Actions / Use-cases / Services / Repos
3. Páginas públicas em `/surveys`
4. Páginas de dashboard em `/dashboard/surveys`
5. Criação, edição, publicação, encerramento, resposta e resultados
6. Regras de anonimato e anti-duplicidade

### Contexto atual da branch `feat/surveys`

A branch atual já criou uma estrutura inicial em `src/modules/surveys`, duas migrations e alguns componentes/UI base. Porém, o módulo ainda não está funcional em produção. Os principais gaps encontrados foram:

- Não existem páginas novas em `src/app` para `/surveys` nem `/dashboard/surveys`
- Não existe integração com navegação/sidebar do dashboard
- A permissão usada atualmente é `org.admin.update`, mas o produto precisa de uma permissão dedicada `surveys.manage`
- As tabelas de surveys estão com `RLS` desabilitado
- O fluxo de criação/edição persiste `position` zero-based, enquanto o banco exige posição positiva
- O fluxo de edição pode apagar respostas históricas ao recriar perguntas
- O fluxo de resposta não valida status, visibilidade, janela de disponibilidade nem membership de pesquisas privadas
- O fluxo de resposta aceita payload adulterado com perguntas de outra survey
- Não existem testes automatizados cobrindo o módulo

Este PRD cobre a correção completa desses pontos, mantendo alinhamento com `AGENTS.md`.

### Premissas aprovadas nesta definição

- Permissão oficial: `OWNER` e membros com nova permissão `surveys.manage`
- Escopo da entrega: completo, incluindo banco, backend, páginas, submissão e resultados
- Após a primeira resposta, perguntas/opções não podem mais ser editadas
- Resultados completos estarão disponíveis no dashboard, respeitando anonimato
- Campos `starts_at` e `ends_at` farão parte oficial da UI da V1
- Surveys públicas para usuários não autenticados poderão coletar nome, email e telefone quando a resposta não for anônima
- Anti-duplicidade seguirá estratégia híbrida:
  - usuário autenticado: bloqueio por usuário
  - resposta anônima / contexto sem autenticação: bloqueio por fingerprint/cookie
  - risco residual aceito para cenários como limpeza de cookie, troca de navegador ou dispositivo

### Decisão operacional desta V1

Para manter consistência com o requisito de anti-duplicidade aprovado:

- Usuário autenticado pode responder de forma identificada ou anônima quando a survey permitir anonimato
- Usuário não autenticado pode responder surveys públicas de forma identificada preenchendo nome, email e telefone
- Usuário não autenticado pode responder surveys públicas anonimamente apenas quando a survey permitir anonimato
- Pesquisas privadas continuam restritas a membros ativos autenticados da organização
- Se a survey **não** aceitar anonimato, o usuário não autenticado deve preencher nome, email e telefone para responder
- Quando a resposta for anônima, dados de identificação manual não devem ser persistidos nem exibidos

Esta V1 **inclui** identificação explícita de respondente público não autenticado quando a resposta não for anônima.

---

## Goals

- Entregar módulo de surveys funcional do banco até a UI
- Criar permissão dedicada `surveys.manage` e remover o acoplamento com `org.admin.update`
- Permitir surveys públicas e privadas conforme o requisito de produto
- Suportar quatro tipos de questão: objetiva, discursiva, checkbox e ranking
- Expor datas de início e encerramento na UI de criação, listagem, detalhe e resposta
- Garantir que respostas anônimas nunca revelem identidade nos resultados
- Suportar identificação explícita de respondente público não autenticado em surveys públicas
- Bloquear resposta duplicada dentro da estratégia híbrida aprovada
- Bloquear edição estrutural de pesquisas após a primeira resposta
- Disponibilizar resultados completos no dashboard para usuários autorizados
- Alinhar toda a implementação à arquitetura descrita em `AGENTS.md`

---

## User Stories

### US-001: Criar permissão dedicada `surveys.manage`
**Description:** Como administrador do sistema, quero uma permissão dedicada para gerenciar surveys, para que o acesso não dependa indevidamente de `org.admin.update`.

**Acceptance Criteria:**
- [ ] Criar migration para inserir a permissão `surveys.manage` na tabela `public.permissions`
- [ ] Atualizar `src/modules/auth/shared/permissions.ts` com a nova constante
- [ ] Atualizar `src/modules/auth/shared/permission-presenter.ts` com label e descrição legíveis
- [ ] Todos os fluxos de criar, editar, publicar, encerrar e ver resultados de surveys passam a depender de `surveys.manage` ou papel `OWNER`
- [ ] Nenhum fluxo de surveys depende mais de `org.admin.update`
- [ ] A permissão aparece corretamente no catálogo de permissões já usado pela UI de roles
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

### US-002: Endurecer schema das tabelas de surveys
**Description:** Como desenvolvedor, preciso corrigir o schema das tabelas de surveys para evitar inconsistências de dados e garantir integridade.

**Acceptance Criteria:**
- [ ] Criar migration corretiva para alinhar `survey_questions.position` e `survey_question_options.position` ao contrato final da aplicação
- [ ] O contrato final de persistência deve ser explícito e consistente: posições armazenadas em base 1
- [ ] Adicionar proteção de banco para impedir `survey_response_items.question_id` pertencente a outra survey que não seja a `survey_id` da resposta
- [ ] Adicionar suporte explícito a identificação de respondente público não autenticado na V1
- [ ] O modelo final deve suportar nome, email e telefone para respostas públicas não autenticadas e não anônimas
- [ ] Quando a resposta for anônima, campos de identificação manual devem permanecer nulos
- [ ] Manter ou ajustar constraints para impedir opções duplicadas dentro da mesma pergunta
- [ ] Manter a constraint de resposta única por `(survey_id, respondent_user_id)` quando `respondent_user_id` existir
- [ ] Manter a constraint de resposta única por `(survey_id, responder_fingerprint_hash)` quando `responder_fingerprint_hash` existir
- [ ] Migrations novas são aditivas/corretivas; não reescrevem migrations históricas já aplicadas
- [ ] `npm run db:gen-types` é executado após mudanças de schema
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

### US-003: Habilitar RLS e políticas seguras para surveys
**Description:** Como equipe de produto, queremos que os dados de surveys respeitem visibilidade, membership e anonimato também no banco, e não apenas na camada de aplicação.

**Acceptance Criteria:**
- [ ] Habilitar `RLS` em `surveys`, `survey_questions`, `survey_question_options`, `survey_responses` e `survey_response_items`
- [ ] Definir política de leitura pública apenas para surveys `public`, `published` e disponíveis para resposta
- [ ] Definir política de leitura privada apenas para membros ativos da organização da survey
- [ ] Definir política de leitura/gestão completa para `OWNER` ou membro com `surveys.manage`
- [ ] Definir política de inserção de respostas para surveys públicas publicadas
- [ ] Definir política de inserção de respostas para surveys privadas publicadas apenas por membros ativos da organização
- [ ] Garantir que respostas anônimas nunca exponham `respondent_user_id` em views seguras ou projeções usadas pelo dashboard
- [ ] Garantir que respostas anônimas nunca exponham nome, email ou telefone informados manualmente por respondente público
- [ ] Revisar e, se necessário, ajustar as views seguras `survey_responses_safe` e `survey_response_items_safe`
- [ ] Haver documentação mínima no PRD/código sobre por que cada política existe
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

### US-004: Regenerar tipos e consolidar contratos do módulo
**Description:** Como desenvolvedor, quero contratos tipados e DTOs claros para evitar retorno de entidades cruas ao cliente e para manter Actions e páginas previsíveis.

**Acceptance Criteria:**
- [ ] Regenerar `src/shared/types/supabase.d.ts`
- [ ] Ajustar `src/modules/surveys/shared/types/db.ts` para refletir o schema final
- [ ] Expandir `src/modules/surveys/shared/types/dto.ts` com DTOs de listagem, detalhe, formulário de resposta e resultados
- [ ] Actions públicas e de dashboard retornam DTOs em camelCase, não rows cruas do Supabase
- [ ] Os tipos de pergunta e resposta cobrem `single_choice`, `textarea`, `checkbox` e `ranking`
- [ ] Nenhum componente client importa tipos de `server/`
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

### US-005: Backend de listagem pública em `/surveys`
**Description:** Como visitante do tenant, quero listar surveys públicas disponíveis para resposta, para descobrir pesquisas abertas da organização.

**Acceptance Criteria:**
- [ ] Manter ou refatorar o slice `list-public-surveys` para retornar apenas surveys públicas e publicadas do tenant atual
- [ ] A organização é resolvida pelo host atual (`app_domain`) no use-case
- [ ] Surveys `draft`, `closed` ou indisponíveis não aparecem na listagem pública
- [ ] O use-case retorna DTO próprio para a UI pública, com informações suficientes para cards de listagem
- [ ] A listagem pública não exige autenticação
- [ ] O código segue o padrão `Action -> Use-case -> Service -> Repo`
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

### US-006: Backend de listagem do dashboard em `/dashboard/surveys`
**Description:** Como membro da organização, quero listar surveys da organização no dashboard para responder surveys privadas e acompanhar surveys públicas/privadas conforme meu papel.

**Acceptance Criteria:**
- [ ] Manter ou refatorar o slice `list-dashboard-surveys` para retornar surveys da organização atual
- [ ] A listagem do dashboard exige usuário autenticado e membership ativo na organização
- [ ] A listagem do dashboard inclui surveys `public` e `private`
- [ ] A listagem do dashboard pode incluir `draft`, `published` e `closed`, pois é uma superfície administrativa/membro
- [ ] O DTO do dashboard inclui no mínimo: `id`, `title`, `description`, `status`, `visibility`, `acceptAnonymousAnswers`, `createdAt`, `startsAt`, `endsAt`
- [ ] A resposta do backend não expõe dados de resultados nem identidade de respondentes nesta listagem
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

### US-007: Criar survey de forma atômica
**Description:** Como usuário com permissão, quero criar uma survey com perguntas e opções sem risco de persistência parcial.

**Acceptance Criteria:**
- [ ] O fluxo `create-survey` usa `OWNER` ou `surveys.manage`
- [ ] O fluxo valida título, descrição, visibilidade, anonimato e estrutura das perguntas com Zod antes de persistir
- [ ] O fluxo valida `startsAt` e `endsAt`, incluindo regra de ordenação temporal coerente
- [ ] Questões `single_choice`, `checkbox` e `ranking` exigem no mínimo 2 opções
- [ ] Questões `textarea` não aceitam opções
- [ ] Posições de perguntas e opções são persistidas em base 1
- [ ] A persistência de survey + perguntas + opções é atômica; falha em qualquer etapa não deixa lixo parcial no banco
- [ ] O fluxo retorna `OperationResponse` explícito com DTO previsível
- [ ] O fluxo não chama repo direto a partir da action
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

### US-008: Editar, publicar e encerrar survey com regras corretas
**Description:** Como usuário com permissão, quero editar metadados da survey, publicar quando estiver válida e encerrar quando necessário, sem correr risco de apagar respostas.

**Acceptance Criteria:**
- [ ] Os fluxos `update-survey`, `publish-survey` e `close-survey` usam `OWNER` ou `surveys.manage`
- [ ] Publicar exige pelo menos 1 pergunta válida
- [ ] Campos `startsAt` e `endsAt` podem ser editados pela UI oficial da V1
- [ ] Encerrar muda o status para `closed` e bloqueia novas respostas
- [ ] Se a survey já tiver ao menos 1 resposta, qualquer tentativa de alterar perguntas/opções retorna erro de negócio explícito
- [ ] Metadados não estruturais da survey continuam podendo ser ajustados após respostas, se a regra do produto permitir
- [ ] O fluxo de edição não apaga perguntas existentes para recriá-las quando houver respostas
- [ ] O fluxo de edição não pode apagar `survey_response_items` históricos
- [ ] A action retorna códigos de erro explícitos, por exemplo: `survey_not_found`, `not_allowed`, `survey_locked_after_response`, `infra_error`
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

### US-009: Carregar detalhe de survey para resposta
**Description:** Como usuário público ou membro da organização, quero abrir uma survey específica e receber apenas os dados necessários para responder.

**Acceptance Criteria:**
- [ ] Criar slice próprio para carregar detalhe de survey para resposta pública e privada
- [ ] O backend valida host/tenant antes de retornar survey pública
- [ ] O backend valida membership antes de retornar survey privada no dashboard
- [ ] Surveys `draft`, `closed` ou indisponíveis retornam erro de negócio previsível
- [ ] O DTO de resposta inclui: metadados da survey, perguntas ordenadas, opções ordenadas, flags de anonimato, `startsAt` e `endsAt`
- [ ] O DTO informa com clareza quando a survey ainda não começou ou já se encerrou
- [ ] O DTO não inclui dados de resultados nem lista de respondentes
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

### US-010: Submeter respostas com validação completa e anti-duplicidade híbrida
**Description:** Como respondente, quero enviar minha resposta uma única vez, respeitando visibilidade, anonimato e regras da survey.

**Acceptance Criteria:**
- [ ] O fluxo de submissão valida existência da survey, status `published`, visibilidade e disponibilidade antes de inserir qualquer dado
- [ ] Surveys privadas só aceitam resposta de membros ativos da organização
- [ ] Usuário autenticado pode responder identificado ou anônimo quando a survey permitir
- [ ] Usuário não autenticado pode responder survey pública de forma identificada preenchendo nome, email e telefone
- [ ] Usuário não autenticado pode responder survey pública anonimamente apenas quando a survey aceitar anonimato
- [ ] Se a survey não aceitar anonimato e o usuário estiver deslogado, o backend exige nome, email e telefone
- [ ] Quando a resposta pública não autenticada for identificada, nome, email e telefone são persistidos
- [ ] Quando a resposta for anônima, nome, email e telefone não são persistidos
- [ ] O fluxo rejeita qualquer `questionId` que não pertença à survey carregada
- [ ] O fluxo rejeita payload com respostas extras, duplicadas ou incompatíveis com o tipo da pergunta
- [ ] O fluxo persiste resposta + itens de resposta de forma atômica
- [ ] Tentativa de segunda resposta do mesmo usuário autenticado para a mesma survey retorna `already_answered`
- [ ] Tentativa de segunda resposta anônima no mesmo navegador/contexto retorna `already_answered`
- [ ] Erros de constraints/triggers do banco são traduzidos para códigos de negócio compreensíveis
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

### US-011: Agregar resultados completos para o dashboard
**Description:** Como usuário autorizado, quero visualizar os resultados completos de uma survey no dashboard, respeitando anonimato e tipo de pergunta.

**Acceptance Criteria:**
- [ ] Criar slice/use-case/action específico para carregar resultados de uma survey
- [ ] Apenas `OWNER` ou membro com `surveys.manage` pode acessar resultados
- [ ] Para `single_choice`, retornar contagem e percentual por opção
- [ ] Para `checkbox`, retornar contagem e percentual por opção
- [ ] Para `ranking`, retornar distribuição e uma métrica agregada clara de ordenação (ex.: média de posição por opção)
- [ ] Para `textarea`, retornar lista de respostas textuais com data/hora e identidade apenas quando a resposta não for anônima
- [ ] Respostas anônimas nunca exibem `respondent_user_id`, nome ou qualquer outro identificador pessoal
- [ ] Para respostas públicas não autenticadas e não anônimas, o dashboard pode exibir nome, email e telefone aos usuários autorizados
- [ ] O backend de resultados usa view segura, projeção segura ou ambas
- [ ] O DTO de resultados é estável e não depende de rows brutas do banco
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

### US-012: Criar página pública de listagem `/surveys`
**Description:** Como visitante, quero uma página pública que liste surveys abertas para resposta neste tenant.

**Acceptance Criteria:**
- [ ] Criar `src/app/surveys/page.tsx` como Server Component
- [ ] A página chama action server-side de listagem pública
- [ ] Cada card exibe no mínimo título, descrição curta, status visual, informação de anonimato, data de encerramento quando existir e CTA para responder
- [ ] A página trata empty state quando não houver surveys públicas disponíveis
- [ ] A página não importa repos/services/use-cases diretamente
- [ ] A página não usa `"use client"` desnecessariamente
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam
- [ ] Verify in browser using dev-browser skill

---

### US-013: Criar página pública de resposta `/surveys/[surveyId]`
**Description:** Como visitante, quero abrir uma survey pública e responder pelo site.

**Acceptance Criteria:**
- [ ] Criar `src/app/surveys/[surveyId]/page.tsx` como Server Component
- [ ] A página carrega survey pública do tenant atual via action server-side
- [ ] A UI renderiza os quatro tipos de pergunta suportados
- [ ] A UI informa claramente quando a survey aceita ou não respostas anônimas
- [ ] A UI exibe `startsAt` e `endsAt` de forma clara, especialmente a data de encerramento
- [ ] Quando o usuário estiver deslogado, a UI permite resposta identificada com nome, email e telefone
- [ ] Quando o usuário estiver deslogado e a survey aceitar anonimato, a UI oferece escolha entre resposta identificada e anônima
- [ ] Quando o usuário selecionar resposta anônima, os campos de nome, email e telefone ficam ocultos ou desabilitados
- [ ] Quando o usuário estiver deslogado e a survey não aceitar anonimato, a UI exige nome, email e telefone
- [ ] A submissão mostra feedback de sucesso e de erros de negócio como `already_answered`
- [ ] A página trata estado de survey indisponível/encerrada com empty state explícito
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam
- [ ] Verify in browser using dev-browser skill

---

### US-014: Criar página de listagem do dashboard `/dashboard/surveys`
**Description:** Como membro da organização, quero acessar uma listagem de surveys no dashboard para responder pesquisas privadas e acompanhar surveys da organização.

**Acceptance Criteria:**
- [ ] Criar `src/app/dashboard/surveys/page.tsx`
- [ ] A página exige dashboard access e membership ativo
- [ ] A listagem mostra surveys públicas e privadas da organização
- [ ] Cada item exibe visibilidade, status, datas principais e CTA apropriado ao contexto
- [ ] Usuários com `surveys.manage` veem ações de gerenciar, publicar, encerrar e ver resultados
- [ ] Usuários sem `surveys.manage` não veem ações administrativas, mas podem acessar surveys que devem responder
- [ ] A página trata empty state quando a organização ainda não possui surveys
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam
- [ ] Verify in browser using dev-browser skill

---

### US-015: Criar experiência de criação e edição no dashboard
**Description:** Como usuário com permissão, quero criar e editar surveys através do dashboard com um builder usável e consistente.

**Acceptance Criteria:**
- [ ] Criar `src/app/dashboard/surveys/new/page.tsx`
- [ ] Criar rota de edição adequada, por exemplo `src/app/dashboard/surveys/[surveyId]/edit/page.tsx`
- [ ] Refatorar ou substituir `src/modules/surveys/shared/ui/survey-builder.tsx` para suportar o contrato final do produto
- [ ] O builder permite adicionar, remover e reordenar perguntas
- [ ] O builder permite adicionar, remover e reordenar opções quando aplicável
- [ ] O builder permite configurar: título, descrição, visibilidade, aceitação de anonimato, `startsAt` e `endsAt`
- [ ] O builder valida no cliente e no servidor
- [ ] Se a survey já tiver respostas, campos estruturais ficam bloqueados com explicação visível
- [ ] Fluxos de salvar draft, publicar e encerrar estão disponíveis conforme status e permissão
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam
- [ ] Verify in browser using dev-browser skill

---

### US-016: Criar página de resposta de survey privada no dashboard
**Description:** Como membro da organização, quero responder surveys privadas pelo dashboard.

**Acceptance Criteria:**
- [ ] Criar rota adequada para detalhe/resposta de survey no dashboard, por exemplo `src/app/dashboard/surveys/[surveyId]/page.tsx`
- [ ] A página carrega surveys privadas e públicas da organização quando o usuário é membro ativo
- [ ] A UI reutiliza, quando fizer sentido, um renderer comum entre superfície pública e dashboard
- [ ] A UI respeita as mesmas regras de anonimato e validação da superfície pública
- [ ] Surveys `draft` não podem ser respondidas por membros comuns
- [ ] Surveys `closed` aparecem como encerradas e sem CTA de envio
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam
- [ ] Verify in browser using dev-browser skill

---

### US-017: Criar página de resultados no dashboard
**Description:** Como usuário autorizado, quero uma página de resultados clara e útil para analisar as respostas da survey.

**Acceptance Criteria:**
- [ ] Criar rota dedicada de resultados, por exemplo `src/app/dashboard/surveys/[surveyId]/results/page.tsx`
- [ ] A rota exige `OWNER` ou `surveys.manage`
- [ ] A UI mostra resumo geral da survey, total de respostas e resultados por pergunta
- [ ] Questões objetivas exibem contagem e percentual por opção
- [ ] Questões de ranking exibem agregação compreensível e ordenável
- [ ] Questões discursivas exibem lista de respostas textuais
- [ ] Na V1, respostas discursivas não exigem paginação nem filtro
- [ ] Respostas identificadas exibem autor apenas quando a resposta não for anônima
- [ ] Para respostas públicas identificadas e não autenticadas, a UI autorizada pode exibir nome, email e telefone
- [ ] Respostas anônimas exibem marcador explícito de anonimato sem qualquer dado identificável
- [ ] A UI trata corretamente surveys sem respostas
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam
- [ ] Verify in browser using dev-browser skill

---

### US-018: Integrar navegação, discoverability e badges de status
**Description:** Como usuário, quero descobrir facilmente a feature de surveys no produto e entender o estado de cada survey.

**Acceptance Criteria:**
- [ ] Atualizar `src/modules/app-shell/shared/navigation/nav-main.ts` para incluir Surveys no dashboard
- [ ] O item de navegação aponta para `/dashboard/surveys`
- [ ] Refatorar `src/modules/surveys/shared/ui/survey-status-badge.tsx` para labels localizadas e coerentes com o design do produto
- [ ] A listagem pública e do dashboard usam badge de status consistente
- [ ] A listagem do dashboard usa badge de visibilidade consistente (`public` / `private`)
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam
- [ ] Verify in browser using dev-browser skill

---

### US-019: Cobertura automatizada e checklist de QA
**Description:** Como time, queremos uma suíte mínima de testes e um checklist de QA para evitar regressões no módulo de surveys.

**Acceptance Criteria:**
- [ ] Criar testes unitários ou de use-case para permissões, publicação, bloqueio pós-resposta e anti-duplicidade
- [ ] Criar testes de integração para constraints/políticas críticas do banco
- [ ] Criar testes para validação dos quatro tipos de pergunta
- [ ] Criar testes cobrindo respostas anônimas e identificadas
- [ ] Criar testes cobrindo tentativa de envio de `questionId` de outra survey
- [ ] Criar testes cobrindo visibilidade pública vs. privada
- [ ] Atualizar `src/modules/surveys/README.md` com checklist de QA final alinhado à implementação de fato
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam

---

## Functional Requirements

- FR-1: O sistema deve criar a permissão `surveys.manage` e usá-la em todos os fluxos administrativos de surveys.
- FR-2: Usuários com papel `OWNER` devem continuar autorizados mesmo sem vinculação explícita da permissão.
- FR-3: A surface pública deve existir em `/surveys`.
- FR-4: A surface de dashboard deve existir em `/dashboard/surveys`.
- FR-5: Surveys públicas publicadas devem aparecer em `/surveys` e em `/dashboard/surveys`.
- FR-6: Surveys privadas publicadas não devem aparecer em `/surveys`.
- FR-7: Surveys privadas publicadas devem aparecer em `/dashboard/surveys` apenas para membros ativos da organização.
- FR-8: O sistema deve suportar perguntas dos tipos `single_choice`, `textarea`, `checkbox` e `ranking`.
- FR-9: Perguntas dos tipos `single_choice`, `checkbox` e `ranking` devem exigir no mínimo 2 opções.
- FR-10: Perguntas `textarea` não podem conter opções.
- FR-11: O sistema deve persistir ordem de perguntas e opções em base 1, de forma consistente entre UI, validação e banco.
- FR-12: O backend de criação e edição deve usar operações atômicas para evitar persistência parcial.
- FR-13: A action nunca deve chamar repo diretamente; a arquitetura obrigatória é `Action -> Service ou Use-case`, `Use-case -> Service(s)`, `Service -> Repo`.
- FR-14: Após a primeira resposta, perguntas e opções de uma survey não podem mais ser editadas.
- FR-15: Após a primeira resposta, o sistema pode permitir edição apenas de metadados não estruturais, se a regra da tela permitir.
- FR-16: Publicar uma survey exige pelo menos uma pergunta válida.
- FR-17: Encerrar uma survey deve bloquear novas respostas.
- FR-18: O backend de submissão deve validar status, visibilidade, tenant e disponibilidade antes de persistir.
- FR-19: O backend deve rejeitar payload com perguntas que não pertencem à survey alvo.
- FR-20: O sistema deve impedir segunda resposta do mesmo usuário autenticado à mesma survey.
- FR-21: O sistema deve impedir segunda resposta anônima no mesmo contexto de navegador/cookie à mesma survey.
- FR-22: O sistema deve aceitar o risco residual conhecido da estratégia por fingerprint/cookie.
- FR-23: Usuário autenticado pode escolher responder anonimamente quando a survey aceitar anonimato.
- FR-24: Usuário não autenticado pode responder survey pública de forma identificada informando nome, email e telefone.
- FR-25: Usuário não autenticado pode responder survey pública anonimamente apenas quando a survey aceitar anonimato.
- FR-26: Se a survey não aceitar anonimato, usuário não autenticado deve informar nome, email e telefone para responder.
- FR-27: Respostas públicas identificadas e não autenticadas devem persistir nome, email e telefone.
- FR-28: Respostas anônimas não podem expor identidade em nenhuma listagem, agregação ou tela de resultados.
- FR-29: O dashboard de resultados pode exibir nome, email e telefone apenas para respostas públicas identificadas e não anônimas, e apenas para usuários autorizados.
- FR-30: Resultados completos devem existir no dashboard para usuários com `surveys.manage` ou `OWNER`.
- FR-31: Resultados de perguntas objetivas devem expor contagem e percentual por opção.
- FR-32: Resultados de ranking devem expor uma agregação clara por opção.
- FR-33: Resultados de perguntas discursivas devem listar respostas textuais, preservando anonimato.
- FR-34: `starts_at` e `ends_at` devem ser configuráveis na UI oficial da V1.
- FR-35: A UI pública e do dashboard deve exibir a data de encerramento da survey quando existir.
- FR-36: O módulo deve usar DTOs próprios em vez de retornar entidades cruas do Supabase para o cliente.
- FR-37: `src/app/` deve conter apenas entradas do App Router; toda lógica de domínio deve permanecer em `src/modules/surveys/` e `src/shared/`.
- FR-38: Componentes compartilhados do módulo devem ficar em `src/modules/surveys/shared/ui/`.
- FR-39: Novas queries que dependam de visibilidade pública/privada devem respeitar o tenant resolvido por `app_domain`.
- FR-40: O dashboard deve exibir ações administrativas apenas para usuários autorizados.
- FR-41: O módulo deve incluir testes automáticos cobrindo permissões, integridade, anonimato e anti-duplicidade.

---

## Non-Goals

- Lógica condicional entre perguntas (ex.: mostrar pergunta B apenas se resposta A for X)
- Surveys multi-step ou multi-page
- Upload de arquivos em respostas
- Exportação CSV/Excel/PDF na V1
- Edição de respostas já enviadas
- Reabertura automática de surveys encerradas
- Notificações por email/WhatsApp quando uma survey for publicada ou respondida
- Dashboard público de resultados fora da área autenticada
- Métricas avançadas de analytics além dos resultados por pergunta
- Paginação e filtros avançados para respostas discursivas na V1

---

## Design Considerations

- Reutilizar e refatorar os componentes já iniciados em `src/modules/surveys/shared/ui/` sempre que fizer sentido:
  - `survey-builder.tsx`
  - `survey-renderer.tsx`
  - `survey-status-badge.tsx`
- `survey-status-badge.tsx` deve usar labels localizadas (`Rascunho`, `Publicada`, `Encerrada`) e variantes visuais consistentes com o resto do produto.
- A listagem pública deve priorizar clareza e CTA direto para responder.
- A listagem do dashboard deve diferenciar visualmente `public` e `private`.
- A data de encerramento deve ser visível de forma destacada nas páginas de listagem e detalhe.
- A página de criação/edição deve usar primitives já existentes do shadcn/ui (`Input`, `Textarea`, `Select`, `Checkbox`, `Button`, `Dialog`, `Badge`, etc.).
- A UI de resultados deve privilegiar leitura rápida:
  - totais no topo
  - blocos por pergunta
  - empty states explícitos
  - anonimato claramente sinalizado
- Na superfície pública, quando o usuário estiver deslogado, a UI deve deixar claro quando a resposta será identificada por nome/email/telefone e quando será anônima.
- A UI de resposta deve deixar claro:
  - se a survey aceita anonimato
  - quando o usuário está respondendo anonimamente
  - quando o login é necessário por regra de acesso, por exemplo em surveys privadas

---

## Technical Considerations

- Seguir rigorosamente a organização feature-first em `src/modules/surveys/`.
- `src/app/` deve conter apenas:
  - `page.tsx`
  - `layout.tsx`
  - outros entrypoints do App Router
- Services devem consumir apenas 1 repo cada.
- Toda orquestração com múltiplos passos deve ficar em use-cases.
- Repos de surveys devem ser extremamente finos e conter apenas acesso a dados.
- Como a criação, edição estrutural e submissão de resposta precisam ser atômicas, a implementação final deve usar um mecanismo transacional real.
  - Opção recomendada: RPCs/funções SQL específicas para os fluxos críticos
  - Alternativa aceitável: outro caminho que garanta atomicidade real e rollback completo
- Se forem usados RPCs, eles devem ser encapsulados por repo thin e consumidos por service, mantendo a arquitetura.
- Preferir `createClient` SSR para fluxos do usuário autenticado.
- Usar `admin repo` apenas se houver motivo claro e documentado.
- Para respondentes públicos não autenticados, a implementação final deve suportar snapshot explícito de nome, email e telefone na resposta identificada, preservando nulidade total desses campos em respostas anônimas.
- Como `starts_at` e `ends_at` farão parte da UI oficial, a implementação deve definir claramente timezone, serialização e regras de exibição dessas datas.
- Como o módulo tem superfície pública e sensibilidade de privacidade, `RLS` é obrigatória para as tabelas de surveys.
- Se houver mudança de schema, executar `npm run db:gen-types`.
- Antes de encerrar a implementação, executar `npm run fix:biome && npm run lint:biome && npm run typecheck`.
- O README do módulo deve refletir o comportamento final real, não apenas intenções.

### Sugestão de rotas desta V1

- Pública:
  - `/surveys`
  - `/surveys/[surveyId]`
- Dashboard:
  - `/dashboard/surveys`
  - `/dashboard/surveys/new`
  - `/dashboard/surveys/[surveyId]`
  - `/dashboard/surveys/[surveyId]/edit`
  - `/dashboard/surveys/[surveyId]/results`

### Sugestão de slices server do módulo

- `list-public-surveys`
- `list-dashboard-surveys`
- `get-survey-for-response`
- `create-survey`
- `update-survey`
- `publish-survey`
- `close-survey`
- `submit-survey-response`
- `get-survey-results`

---

## Success Metrics

- Um usuário `OWNER` consegue criar, publicar e encerrar uma survey completa sem precisar acessar banco/manual SQL.
- Um membro com `surveys.manage` consegue executar os mesmos fluxos de gestão sem usar `org.admin.update`.
- Surveys públicas publicadas ficam visíveis e respondíveis em `/surveys`.
- Surveys privadas publicadas ficam visíveis e respondíveis apenas em `/dashboard/surveys` para membros ativos.
- Respondente público não autenticado consegue responder de forma identificada informando nome, email e telefone.
- Nenhuma resposta anônima expõe identidade na tela de resultados.
- O fluxo nominal de segunda resposta é bloqueado para:
  - mesmo usuário autenticado
  - mesmo contexto anônimo por cookie/fingerprint
- Não existe perda de respostas históricas ao editar surveys, porque edição estrutural é bloqueada após a primeira resposta.
- O checklist de QA do módulo passa integralmente.
- `npm run fix:biome && npm run lint:biome && npm run typecheck` passam ao final da entrega.

---

## Open Questions

- Nenhuma open question bloqueante no momento.
- Decisões fechadas para a V1:
  - `starts_at` e `ends_at` serão expostos oficialmente na UI
  - A página de resultados não terá paginação/filtro para respostas discursivas na V1
  - Exportação CSV fica explicitamente para V2
  - Surveys públicas para usuários não autenticados suportarão resposta identificada com nome, email e telefone, além da opção anônima quando permitida
