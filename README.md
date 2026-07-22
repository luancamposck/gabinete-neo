# Correios
- Uso de endereços da mala direta

# Mala direta
- Cadastro de pessoas
- Link pra zap

# Área de Cidadão
- Dados da mala direta

# CRM Eleitoral


# Nível
- Centro de ativista


---

* Remover admin repos de /dashboard/layout.tsx

---
*06/12/2025*
Feitos agora:
- "Organização" para "Constelação"
- Consertar sistema de logout

A fazer:
- [X] Link mais curto
- [X] Verificar se o número de telefone tem DDD válido
- [X] Checar a UI para mobile
- [X] Listar de contatos(mandar para produção)
- [X] Módulo de tarefas

Futuramente:
- Verificar telefone com mensagem(Whatsapp ou MSN)
- Página do usuário(colocar foto de perfil, trocar de senha,nome)
- InfoNEO
- Formulário Anônimo
- Upload de  imagem do candidato para aparecer nos formulários de inscrição e no dashboard

---
*24/12/2025*

- [X] Efeito de estrelas nas páginas da Constelação X.
- [X] Em "minha constelação", corrigir a palavra membros.
- [ ] Mapa 🗺️ (super importante)
- [ ] ⁠Demandas (um formulário para as estrelas entrarem em contato, tipo suporte).
- [ ] ⁠Disparo de mensagens por WhatsApp e SMS.

---

# Seed de desenvolvimento (usuários de teste)

Rodar `npm run db:reset` cria a organization `Organizacao Local` (`app_domain=localhost`)
e os usuários de teste abaixo, todos com senha `password123`:

| Email | Role | Estado |
|---|---|---|
| owner@localhost.dev | OWNER | — |
| admin@localhost.dev | ADMIN | — |
| staff@localhost.dev | STAFF | — |
| member@localhost.dev | MEMBER | membro comum, sem candidatura de motorista |
| member.driver@localhost.dev | MEMBER | motorista aprovado (aparece em `drivers`) |
| member.driver.pending@localhost.dev | MEMBER | candidatura de motorista pendente de revisão |
| member.driver.rejected@localhost.dev | MEMBER | candidatura de motorista rejeitada |
| member.inactive@localhost.dev | MEMBER | membership inativa (`is_active=false`) |
| member.referred@localhost.dev | MEMBER | indicado por member@localhost.dev (`referrals`) |

---

# FAQ Técnico — Perguntas e Respostas para Apresentação Comercial

## Stack e Tecnologia

**P: Quais tecnologias o sistema usa?**
R: O Gabinete NEO é construído com Next.js 16 (framework React de última geração), React 19, TypeScript, Tailwind CSS 4 e Supabase como backend (banco de dados PostgreSQL, autenticação e storage). O sistema é 100% web, responsivo e funciona em qualquer dispositivo com navegador.

**P: O sistema é um aplicativo ou um site?**
R: É uma aplicação web progressiva (PWA-ready). Funciona diretamente no navegador, sem necessidade de instalar nada. É responsivo e se adapta a celulares, tablets e desktops.

**P: Precisa instalar algo no computador do cliente?**
R: Não. Basta acessar pelo navegador. Funciona no Chrome, Firefox, Safari e Edge.

---

## Segurança

**P: Os dados estão seguros? Onde ficam armazenados?**
R: Os dados ficam hospedados no Supabase, que roda sobre a infraestrutura da AWS (Amazon Web Services). Os dados são criptografados em trânsito (HTTPS/TLS) e em repouso. O Supabase é certificado SOC 2 Type II e HIPAA-ready.

**P: Como funciona a autenticação dos usuários?**
R: Usamos o sistema de autenticação do Supabase, que é baseado em padrões seguros da indústria (JWT). As senhas são armazenadas com hash bcrypt (nunca em texto puro). O sistema suporta recuperação de senha por e-mail.

**P: Existe controle de permissões? Quem pode ver o quê?**
R: Sim. O sistema possui RBAC (Role-Based Access Control) — controle de acesso baseado em papéis. Cada organização define seus papéis (ex: administrador, coordenador, voluntário) e cada papel tem permissões específicas. No banco de dados, há Row-Level Security (RLS), que impede que um usuário acesse dados que não são dele, mesmo em caso de falha na aplicação.

**P: As chaves de API e credenciais ficam expostas?**
R: Não. As chaves sensíveis (como a Service Role Key do Supabase e a chave do Resend para e-mails) ficam exclusivamente no servidor, em variáveis de ambiente protegidas. O código do front-end só tem acesso à chave pública (anon key), que é projetada para ser exposta e tem permissões limitadas pelas políticas de RLS.

**P: O sistema está protegido contra ataques comuns (SQL Injection, XSS)?**
R: Sim. Toda entrada de dados do usuário é validada com Zod (biblioteca de validação de schemas) antes de chegar ao banco de dados. O Supabase usa consultas parametrizadas que previnem SQL Injection. O Next.js possui proteções nativas contra XSS.

---

## Multi-Tenant (Múltiplas Organizações)

**P: O sistema suporta múltiplos políticos/gabinetes ao mesmo tempo?**
R: Sim. O Gabinete NEO é multi-tenant por design. Cada gabinete/político opera como uma "organização" (chamada internamente de "Constelação") com dados completamente isolados.

**P: Como funciona o isolamento de dados entre organizações?**
R: Cada organização tem um domínio próprio (ex: `gabinete-joao.app.com`, `vereador-maria.app.com`). O sistema identifica a organização pelo domínio acessado e filtra todos os dados automaticamente. Além disso, as políticas de RLS no banco de dados garantem que mesmo em caso de bug, um usuário de uma organização jamais consegue acessar dados de outra.

**P: Um mesmo usuário pode participar de mais de uma organização?**
R: Sim. Um usuário pode ser membro de várias organizações, cada uma com um papel e permissões diferentes. O contexto da organização é determinado pelo domínio acessado.

**P: É possível personalizar cada organização (nome, logo)?**
R: Sim. Cada organização tem nome, descrição e imagem próprios, configuráveis pelo administrador.

---

## Banco de Dados e Infraestrutura

**P: Qual banco de dados é usado?**
R: PostgreSQL 17, gerenciado pelo Supabase. É um dos bancos de dados mais robustos e maduros do mercado, usado por empresas como Instagram, Spotify e Netflix.

**P: Os dados podem ser exportados?**
R: Sim. Como usamos PostgreSQL padrão, os dados podem ser exportados em formatos comuns (CSV, SQL dump). Não há vendor lock-in — os dados são sempre do cliente.

**P: Onde o sistema fica hospedado?**
R: O backend (Supabase) roda na AWS. O frontend pode ser hospedado em qualquer plataforma compatível com Next.js (Vercel, AWS, DigitalOcean, etc.), de acordo com a necessidade de cada cliente.

**P: O sistema aguenta muitos acessos simultâneos?**
R: Sim. A arquitetura é serverless e escala automaticamente conforme a demanda. O Supabase escala o banco de dados e o Next.js suporta edge computing para latência mínima.

---

## Funcionalidades

**P: Quais módulos o sistema possui atualmente?**
R: O sistema conta com: autenticação e controle de acesso (login, cadastro, recuperação de senha), gestão de organizações (criar, convidar membros, definir papéis), mala direta (cadastro de contatos), módulo de tarefas (atribuição e acompanhamento), sistema de indicações/referências entre membros, mapa interativo com geolocalização e envio de e-mails transacionais.

**P: O sistema envia e-mails?**
R: Sim. Usamos o Resend, um serviço profissional de envio de e-mails transacionais. Os e-mails são renderizados com templates React para garantir boa apresentação em todos os clientes de e-mail.

**P: Tem suporte a mapas?**
R: Sim. O sistema possui um módulo de mapa interativo usando MapLibre GL, com suporte a geolocalização e visualização de dados no mapa.

---

## Compliance e LGPD

**P: O sistema está adequado à LGPD?**
R: A arquitetura foi projetada com privacidade em mente. Os dados são isolados por organização, o acesso é controlado por papéis e permissões, as senhas são armazenadas com hash seguro e os dados trafegam sempre com criptografia. A infraestrutura Supabase/AWS possui certificações de compliance (SOC 2). Para adequação completa à LGPD, recomenda-se elaborar uma Política de Privacidade e Termos de Uso específicos para cada operação.

**P: É possível excluir dados de um usuário se ele solicitar?**
R: Sim. O sistema possui funcionalidade de exclusão de conta e dados do usuário, atendendo ao direito de eliminação previsto na LGPD.

---

## Manutenção e Evolução

**P: O código é proprietário ou open-source?**
R: O código é proprietário. O cliente recebe acesso ao sistema como serviço (SaaS), mas o código-fonte pertence à equipe de desenvolvimento.

**P: É fácil adicionar novas funcionalidades?**
R: Sim. A arquitetura é modular (feature-first), com separação clara de responsabilidades (Actions, Services, Repositories). Novos módulos podem ser adicionados sem impactar os existentes.

**P: O sistema tem testes automatizados?**
R: O sistema utiliza validação de tipos com TypeScript e linting com Biome para garantir qualidade de código. A validação de dados com Zod funciona como uma camada adicional de segurança contra inputs inválidos.
