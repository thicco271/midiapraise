# ADSA Reimberg Mídias · Central de Mídia ADSA Reimberg

> Aplicação web oficial para divulgação de cultos, armazenamento de artes e galeria de fotos da ADSA Reimberg.

[![Status](https://img.shields.io/badge/status-Fase%201%2B2%20entregue-blue)]()
[![Stack](https://img.shields.io/badge/stack-Next.js%2016%20%7C%20TypeScript%20%7C%20Prisma%20%7C%20shadcn%2Fui-purple)]()

## Sumário

- [Visão geral](#visão-geral)
- [Status atual](#status-atual)
- [Tecnologias](#tecnologias)
- [Como rodar localmente](#como-rodar-localmente)
- [Acesso administrador inicial](#acesso-administrador-inicial)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Funcionalidades entregues](#funcionalidades-entregues)
- [Roadmap](#roadmap)
- [Documentação](#documentação)
- [Memória do projeto](#memória-do-projeto)

---

## Visão geral

O ADSA Reimberg Mídias é a fonte oficial dos materiais de mídia da ADSA Reimberg. Substitui o uso informal do WhatsApp como repositório de artes e fotos. A aplicação é dividida em duas experiências:

- **Área pública** (`/`, `/eventos`, `/eventos/[slug]`, `/historico`): qualquer pessoa pode consultar o próximo culto, ver eventos anteriores e baixar materiais públicos.
- **Área administrativa** (`/admin/*`): restrita à equipe de mídia. Permite criar/editar eventos, definir destaque, ajustar configurações da igreja e (em fases futuras) subir artes, gerenciar álbuns e aprovar contribuições.

## Status atual

✅ **Fase 1 (Fundação) entregue**
✅ **Fase 2 (Eventos) entregue**

- Autenticação com sessão JWT em cookie httpOnly
- Banco de dados Prisma/SQLite com 7 modelos
- 20 categorias de eventos pré-cadastradas
- Configurações da igreja editáveis (nome, cores, textos, logo)
- Auditoria básica (criar/atualizar/arquivar evento)
- Página pública inicial com próximo culto automático + destaque manual
- Listagem pública com filtros (busca + categoria)
- Detalhe do evento com botões de compartilhar (link + WhatsApp)
- Histórico agrupado por mês com filtro por ano
- Dashboard administrativo com KPIs e pendências
- CRUD completo de eventos (criar, editar, arquivar, publicar)
- Formulário em 4 etapas com indicador de completude
- Design system com paleta azul profundo + dourado
- Layout mobile-first com área de toque 48px
- Foco visível, navegação por teclado, `prefers-reduced-motion`
- Lint 100% limpo, sem erros TypeScript

## Tecnologias

- **Next.js 16** (App Router, Turbopack)
- **TypeScript 5** em modo estrito
- **Tailwind CSS 4** + **shadcn/ui** (New York)
- **Prisma 6** + **SQLite**
- **NextAuth** disponível (não usado — sessão JWT própria com `jose`)
- **bcryptjs** para hash de senhas
- **lucide-react** para ícones
- **sonner** para notificações toast
- **date-fns** para manipulação de datas

## Como rodar localmente

```bash
# 1. Instalar dependências
bun install

# 2. Aplicar schema no banco
bun run db:push

# 3. Rodar seed (cria admin, settings, categorias, evento demo)
bun run scripts/seed.ts

# 4. Iniciar servidor de desenvolvimento
bun run dev
```

Acesse: <http://localhost:3000>

## Acesso administrador inicial

Após rodar o seed:

| Campo | Valor |
|-------|-------|
| URL | `/login` |
| E-mail | `admin@adsapraise.org` |
| Senha | `praisehub2026` |

> ⚠️ Altere a senha assim que possível. A funcionalidade de alteração de senha será entregue na Fase 6 (Administração avançada).

## Estrutura do projeto

Ver [`AGENTS.md`](./AGENTS.md) seção 4 para detalhes completos.

## Funcionalidades entregues

### Área pública

- **`/`** — Hero com próximo culto em destaque, atalhos principais, conteúdo da semana, últimos cultos
- **`/eventos`** — Lista de próximos cultos e já realizados, com busca e filtro por categoria
- **`/eventos/[slug]`** — Detalhe do evento com data/hora/local/pregador/tema/versículo, cards de materiais (placeholder Fase 3), botões copiar link + WhatsApp
- **`/historico`** — Eventos anteriores agrupados por mês, com filtro por ano e busca

### Área administrativa

- **`/admin/dashboard`** — KPIs (total eventos, publicados, rascunhos, sem capa), próximo culto em destaque, eventos da semana, pendências, atividade recente
- **`/admin/eventos`** — Lista de eventos com busca e filtro por status
- **`/admin/eventos/novo`** — Formulário em 4 abas (Informações, Arte, Textos, Revisão) com indicador de completude
- **`/admin/eventos/[id]`** — Editar evento existente
- **`/admin/configuracoes`** — Editar identidade, textos, cores e URLs de logo/ícone

### APIs

- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/events` (lista com filtros), `POST /api/events` (criar)
- `GET /api/events/[id]`, `PATCH /api/events/[id]`, `DELETE /api/events/[id]` (arquivar)
- `GET /api/categories`
- `GET /api/church-settings`, `PATCH /api/church-settings`
- `GET /api/dashboard`
- `GET /api/audit`

## Roadmap

| Fase | Status | Escopo |
|------|--------|--------|
| 1 — Fundação | ✅ Concluída | Repo, auth, banco, perfis, design system |
| 2 — Eventos | ✅ Concluída | CRUD, destaque, próximo culto, histórico |
| 3 — Artes | ⏳ Pendente | Upload real, versões, aprovação, ZIP |
| 4 — Galeria | ⏳ Pendente | Álbuns, upload em massa, miniaturas |
| 5 — Colaboração | ⏳ Pendente | Link de contribuição, moderação |
| 6 — Admin avançado | ⏳ Pendente | Auditoria visual, backup, feedback |
| 7 — Qualidade | ⏳ Pendente | Testes E2E, acessibilidade, performance |

## Documentação

- [`AGENTS.md`](./AGENTS.md) — guia para futuros agentes
- [`CHANGELOG.md`](./CHANGELOG.md) — histórico de alterações
- [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) — memória e decisões do projeto
- [`docs/product.md`](./docs/product.md) — visão de produto
- [`docs/architecture.md`](./docs/architecture.md) — arquitetura técnica
- [`docs/design-system.md`](./docs/design-system.md) — design system
- [`docs/permissions.md`](./docs/permissions.md) — perfis e permissões
- [`docs/storage.md`](./docs/storage.md) — estratégia de armazenamento
- [`docs/privacy.md`](./docs/privacy.md) — privacidade
- [`docs/testing.md`](./docs/testing.md) — estratégia de testes
- [`docs/operations.md`](./docs/operations.md) — operação e manutenção
- [`docs/decisions/`](./docs/decisions/) — decisões técnicas (ADR)

## Memória do projeto

Ver [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md).

---

© ADSA Reimberg · ADSA Reimberg Mídias
