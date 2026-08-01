# Changelog

Todos os cambios notáveis deste projeto serão documentados aqui.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [0.2.0] — 2026-08-02

### Changed

- **Renomeação da aplicação**: "PraiseHub" → "ADSA Reimberg Mídias".
- **Renomeação da igreja**: "ADSA Praise" → "ADSA Reimberg".
- Atualização em todos os arquivos `src/`, `scripts/seed.ts` e documentação (`README.md`, `AGENTS.md`, `CHANGELOG.md`, `PROJECT_MEMORY.md`, `docs/*.md`).
- Atualização do banco de dados existente via `scripts/rename_to_reimberg.ts`:
  - `ChurchSettings` (singleton): `nomeDaIgreja`, `nomeDaAplicacao`, `subtitulo`, `textoPrincipal`, `textoComplementar`.
  - `Profile` admin: nome de "Administrador PraiseHub" → "Administrador ADSA Reimberg".
  - `Event` (demo "Culto da Família"): `local` "Templo ADSA Praise" → "Templo ADSA Reimberg" e descrição atualizada.
- Páginas de detalhe do evento agora exibem o título "ADSA Reimberg Mídias" no `<title>` do browser.
- Header e footer atualizados com o novo nome em todas as páginas.

### Fixed

- **Build de produção quebrava** com erro `useSearchParams() should be wrapped in a suspense boundary at page "/login"`.
  - Causa: a página `/login` usava `useSearchParams()` diretamente no componente raiz, o que impede o Next.js de pré-renderizar a página estaticamente.
  - Correção: extraído o formulário para um componente filho `LoginForm` envolto por `<Suspense>` na página raiz.
  - Impacto: build de produção agora passa sem erros, permitindo deploy no `reimbergmidias.space-z.ai`.

### Preservado (não alterado)

- E-mail do admin `admin@adsapraise.org` (identificador interno, não requer mudança).
- Senha padrão `praisehub2026`.
- Variáveis de ambiente `PRAISEHUB_SESSION_SECRET` e `PRAISEHUB_ADMIN_PASSWORD`.
- Nome do cookie de sessão `praisehub_session`.
- Pasta `src/components/praisehub/` (nome interno, sem impacto visual).
- Tokens CSS `--praise-deep`, `--praise-gold`, `--praise-soft` (mantidos por compatibilidade).

### Added

- Script `scripts/rename_to_reimberg.ts` para atualizar o banco existente.
- Script `scripts/rename_docs.py` para substituir nomes em arquivos `.md`.

## [0.1.0] — 2026-08-01

### Added

- Inicialização do projeto Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui.
- Schema Prisma com 7 modelos: `Profile`, `ChurchSettings`, `EventCategory`, `Event`, `Approval`, `AuditLog`, `ProductFeedback`.
- 20 categorias de eventos pré-cadastradas conforme spec (Culto de Celebração, Santa Ceia, ADSA Kids, CIADSA, etc.).
- Configurações singleton da igreja (`ChurchSettings` com id="singleton").
- Autenticação própria: hash bcrypt + JWT em cookie httpOnly (`jose`).
- Sessão e helpers de permissão (`getCurrentUser`, `canManageEvents`, `canApprove`, `canEditSettings`, `canAccessAdmin`).
- APIs REST: `/api/auth/{login,logout,me}`, `/api/events`, `/api/events/[id]`, `/api/categories`, `/api/church-settings`, `/api/dashboard`, `/api/audit`.
- Página pública inicial (`/`) com:
  - Hero + card do próximo culto (seleção automática ou destaque manual).
  - Atalhos principais (próximo culto, artes, banner/telão, histórico).
  - Conteúdo da semana.
  - Últimos cultos.
- Página `/eventos` com listagem pública, busca e filtro por categoria.
- Página `/eventos/[slug]` com detalhe completo do evento, cards de materiais (placeholder Fase 3), botões copiar link + compartilhar no WhatsApp.
- Página `/historico` com eventos anteriores agrupados por mês, filtro por ano e busca.
- Página `/login` com formulário acessível (labels, foco visível, ícones).
- Área administrativa:
  - `/admin/dashboard` com KPIs, próximo culto, eventos da semana, pendências, atividade recente.
  - `/admin/eventos` com lista + busca + filtro por status.
  - `/admin/eventos/novo` com formulário em 4 abas (Informações, Arte, Textos, Revisão) e indicador de completude.
  - `/admin/eventos/[id]` para edição.
  - `/admin/configuracoes` para editar identidade da igreja.
- Componentes ADSA Reimberg Mídias: `Header`, `Footer`, `AuthProvider`, `AdminGuard`, `EventCard`, `EventForm`, `StatusBadge`, `CopyLinkButton`, `ShareWhatsAppButton`, `DashboardClient`, `AdminEventList`, `ChurchSettingsForm`, `AnoFiltro`.
- Design system em `globals.css` com paleta azul profundo (#0F2A5C) + dourado suave (#C9A227) + branco + cinzas neutros.
- Tokens semânticos (`--color-praise-deep`, `--color-praise-gold`, `--color-praise-soft`).
- Suporte a `prefers-reduced-motion`.
- Áreas de toque 48px mínimas (`.praise-touch`).
- Footer sticky com `min-h-screen flex flex-col`.
- Seed inicial (`scripts/seed.ts`) com admin padrão, configurações, 20 categorias e 1 evento demo (Culto da Família 09/08/2026).
- Documentação: `AGENTS.md`, `README.md`, `PROJECT_MEMORY.md`, `CHANGELOG.md`, `docs/*`.
- Pré-visualizações em `download/preview-*.png`.

### Decisões técnicas

- **SQLite ao invés de PostgreSQL**: o sandbox Z.AI oferece Prisma+SQLite. Quando houver Supabase disponível, migrar (spec 17.3).
- **Sessão JWT própria ao invés de NextAuth**: mais simples para o escopo atual e funciona com SQLite. Migração para NextAuth+Supabase recomendada na Fase 6.
- **Slug sem data por padrão**: `uniqueSlug` apenas adiciona `-2`, `-3` se houver colisão. Evento demo usa slug com data (`culto-da-familia-2026-08-09`) para legibilidade.
- **Datas interpretadas como local (não UTC)**: `formatarData` e APIs tratam `YYYY-MM-DD` como meia-noite local para evitar offset de fuso no America/Sao_Paulo.

### Known limitations

- Upload real de arquivos ainda não implementado (Fase 3).
- Capa do evento é aceita como URL (upload real vem na Fase 3).
- Não há still recuperação de senha (Fase 6).
- Não há testes automatizados ainda (Fase 7).
- Logs do Prisma reduzidos para `['warn','error']` para não poluir `dev.log`.
