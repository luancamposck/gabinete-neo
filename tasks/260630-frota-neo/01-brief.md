# Feature Brief: Frota NEO

## 1. Summary
Frota NEO é um novo módulo que adiciona um link/página de signup específico para pessoas interessadas em se tornar **motoristas da frota** de uma organização. O candidato preenche os mesmos dados do signup atual (`register-and-join`) mais dados do veículo e documentos (CRLV, CNH). Ao concluir, o usuário **já entra imediatamente na organização** (membership normal), e cria-se uma **candidatura de motorista** com status `pending`. Uma pessoa com permissão na organização aprova ou rejeita a candidatura — a aprovação afeta **apenas** se a pessoa se torna motorista, nunca o pertencimento à organização.

## 2. Problem
Hoje o onboarding só permite entrar na organização como membro comum. Não existe um caminho para captar motoristas com os dados operacionais necessários (placa, tipo de veículo, documentos) nem um fluxo de moderação para aprovar quem realmente pode atuar como motorista. Frota NEO cria esse funil de captação + aprovação sem alterar a regra de entrada na organização.

## 3. Target Users
- **Candidato a motorista** (público / visitante com o link de signup de frota): preenche cadastro + dados do veículo + documentos.
- **Aprovador** (membro autenticado com permissão de gestão de frota na organização): revisa candidaturas, vê documentos, aprova ou rejeita.

## 4. Main Flow

### Fluxo A — Signup do motorista
1. Candidato acessa a página/link de signup de frota da organização (resolução por host, como o fluxo atual). O link pode conter `?ref=...` de convite, exatamente como no signup comum.
2. Preenche os campos do signup atual (nome, username, email, senha, telefone, endereço) **mais** os dados de frota:
   - Placa
   - Tipo de veículo (carro, moto, van, etc.)
   - Modelo / ano / cor
   - Upload da foto do documento do veículo (CRLV)
   - Upload da foto da CNH
3. Submete. O sistema, de forma **atômica**:
   - Cria/garante o usuário no Auth + `public.users` + `user_profiles` (usuário novo) ou reaproveita existente.
   - Garante a **membership imediata** na organização.
   - Cria a **candidatura de motorista** (`driver_application`) com status `pending`, referenciando os documentos enviados.
   - Se qualquer passo essencial da candidatura falhar, **tudo falha / faz rollback** (não pode deixar meio-cadastrado).
4. Usuário entra na organização normalmente; a participação como motorista fica `pending`.

### Fluxo B — Aprovação
1. Aprovador (com permissão) acessa a tela de candidaturas de frota da organização.
2. Vê a lista de candidaturas `pending` com dados do veículo e links/preview dos documentos.
3. Aprova ou rejeita.
   - **Aprovado**: cria/ativa o registro de **motorista aprovado** (perfil de driver) vinculado ao usuário/organização.
   - **Rejeitado**: candidatura marcada como `rejected`. O usuário **permanece membro** da organização.

## 5. In Scope (v1)
- Módulo novo `frota` em `src/modules/frota/` (server + shared/ui).
- **Modelo de dados**: registro de `driver_application` (dados do veículo, referências aos documentos, status `pending | approved | rejected`) + registro/perfil de **motorista aprovado**; membership permanece separada e imediata.
- Página/link de signup de motorista com os campos de frota + upload de documentos (CRLV e CNH) via Supabase Storage.
- Extensão do fluxo `register-and-join` para, quando vier no contexto de frota, criar a candidatura de motorista **na mesma transação lógica** (atomicidade com rollback em falha).
- **Link de convidado (`?ref=...`)**: reaproveitado sem trabalho extra ao estender `register-and-join` — o candidato a motorista entra na org já vinculado ao convidante (`invitedByUserId`) e o referral é registrado. A página de signup de frota só precisa propagar o `ref` da URL.
- Migrations Supabase + tipos gerados (`db:gen-types`).
- Nova permission dedicada (nomeada em inglês, como as demais) para o aprovador gerir candidaturas de frota, dentro do sistema de roles/permissions existente.
- Tela de listagem de candidaturas `pending` + ação aprovar/rejeitar (mínimo funcional).

> **Nomenclatura**: módulo `fleet` (`src/modules/fleet/`), rota pública de signup em `/fleet/signup`. Código, tabelas e permission em **inglês**; "Frota NEO" é apenas o nome de exibição do produto.

## 6. Out of Scope (v1)
- Painel completo de gestão/listagem/filtros de motoristas aprovados e histórico (fica para depois).
- Edição/reenvio de documentos pelo próprio motorista após submissão.
- Notificações por email de aprovação/rejeição (pode ser best-effort futuro).
- Fluxo de expiração/renovação de documentos (CNH vencida, etc.).
- Métricas/insights de frota.
- Qualquer alteração na regra de entrada na organização (entrada continua imediata e independente da aprovação).

## 7. Data and Integrations
- **Supabase Auth + Postgres**: reuso de `public.users`, `user_profiles`, memberships. Novas tabelas (nomes em inglês): `driver_applications` (candidatura: dados do veículo, refs de docs, status) e `drivers`/`driver_profiles` para o motorista aprovado.
  - **Placa**: um usuário pode ter várias placas, mas cada placa pertence a **um único dono** — constraint de placa única por proprietário/organização (ver seção 8/9).
- **Atomicidade via RPC transacional**: a parte de dados (membership + `driver_application` + registros relacionados) roda dentro de uma **função Postgres (RPC)** numa única transação, com rollback automático no banco. O passo de Auth permanece fora da transação e usa compensação manual (deletar auth user em falha), no mesmo padrão do fluxo atual.
- **Supabase Storage**: bucket **privado** para documentos de frota (CRLV, CNH). Acesso do aprovador via **signed URLs** de curta duração geradas no server. Upload ocorre **após criar o usuário**, em pasta organizada por `userId`; em caso de falha do fluxo, os arquivos são limpos.
- **Roles & Permissions** (`src/modules/organizations/memberships`): **nova permission dedicada em inglês** para aprovar/gerir frota.
- **Fluxo existente** `register-and-join.use-case.ts`: será estendido/envolvido por um use-case de frota. Hoje orquestra signup → public user/profile → membership com rollback parcial (deleta auth user em falha); a candidatura de motorista entra nessa cadeia — a parte de dados dela via RPC transacional.
- **Arquitetura** (AGENTS.md): módulo `fleet` segue `Action -> Use-case -> Service(s) -> Repo(s)`; repos que usarem `supabaseAdmin` ficam em `*.admin.repo.ts`; sem barrel files; mensagens centralizadas em `MSG_*` no use-case.

## 8. Success Criteria
- Existe a rota `/fleet/signup` que resolve a organização pelo host e propaga `?ref=...`.
- Um candidato consegue se cadastrar enviando placa, tipo, modelo/ano/cor, CRLV e CNH, e ao final: está como membro da organização **e** tem uma `driver_application` `pending`.
- Se a criação da candidatura de motorista falhar, o cadastro inteiro falha e não deixa estado parcial inconsistente (atomicidade verificável via RPC transacional).
- Se o email já for membro da organização, o signup de frota **não altera** profile/membership existentes e apenas cria a `driver_application`.
- A mesma placa não pode ser registrada por dois donos diferentes (constraint respeitada); um mesmo usuário pode ter várias placas.
- Documentos ficam em bucket privado; o aprovador só os acessa via signed URL gerada no server.
- Um usuário com a nova permission de frota consegue ver candidaturas `pending`, abrir os documentos e aprovar/rejeitar.
- Após aprovação, existe um registro de motorista aprovado vinculado ao usuário/organização; após rejeição, o usuário continua membro e a candidatura fica `rejected`.
- `npm run fix:biome && npm run lint:biome && npm run typecheck` passam.

## 9. Decisions (resolvidas) e Open Questions

### Decisões
- **Atomicidade**: RPC transacional no Postgres para a parte de dados (membership + `driver_application`); Auth fora da transação com compensação manual.
- **Upload de docs**: após criar o usuário, em pasta por `userId`, com limpeza de arquivos em caso de falha.
- **Usuário já existente**: apenas cria a `driver_application` (não toca em profile/membership).
- **Permission**: nova permission dedicada, nomeada em inglês, no sistema de roles existente.
- **Segurança de docs**: bucket privado + signed URLs de curta duração geradas no server.
- **Placa**: um usuário pode ter várias placas; cada placa tem um único dono (constraint de unicidade).
- **Nomenclatura**: módulo `fleet`, rota `/fleet/signup`; código/tabelas/permission em inglês.

### Open Questions (para PRD/plano)
- **Escopo da constraint de placa**: unicidade global ou por organização? (placas são nacionais, mas o produto é multi-org).
- **Reenvio/atualização de candidatura**: se o usuário já tem uma candidatura `rejected`, pode submeter nova? Uma `pending` bloqueia nova submissão da mesma placa?
- **Nome exato da permission e da(s) tabela(s)** (`driver_applications`, `drivers`/`driver_profiles`) — confirmar no PRD.
- **Tipos de veículo**: enum fixo (carro, moto, van...) ou lista configurável?
- **Assinatura da RPC**: quais parâmetros/retorno e como o use-case consome o resultado (ids criados, códigos de erro).

## 10. Recommended Next Step
Rodar o **Backend Context Scan** (`/backend-context-scan`) focado em: `register-and-join` (atomicidade/rollback), memberships/roles/permissions, e Supabase Storage — para então seguir com o **PRD** (`/prd`) do Frota NEO.
