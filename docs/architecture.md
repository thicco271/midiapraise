# docs/architecture.md — Arquitetura Técnica

## Visão geral

Aplicação Next.js 16 monolítica com App Router. Tudo em um único repositório, servindo frontend (SSR) + API (Route Handlers) + acesso ao banco.

```
┌────────────────────────────────────────────────────────────┐
│                      Browser (usuário)                     │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼─────────────────────────────────┐
│                   Next.js 16 (porta 3000)                  │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │   App Router     │    │   Route Handlers /api/*      │  │
│  │   (SSR + RSC)    │    │   (auth, events, audit…)     │  │
│  └────────┬─────────┘    └──────────┬───────────────────┘  │
│           │                          │                       │
│           │  Mesma VM, mesmo processo│                       │
│           │                          │                       │
│  ┌────────▼──────────────────────────▼───────────────────┐  │
│  │  lib/ (db, session, praise, utils)                   │  │
│  └────────┬──────────────────────────────────────────────┘  │
└───────────┼─────────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────┐
│           Prisma Client → SQLite (db/custom.db)             │
└─────────────────────────────────────────────────────────────┘
```

## Camadas

### 1. Apresentação — `src/app/**/page.tsx`
- Server Components por padrão ( SSR, acesso direto ao banco).
- Client Components apenas onde há estado/efeitos/handlers (`"use client"`).
- Padrão: `(rota)/page.tsx` busca dados → renderiza → optional Client Component para interatividade.

### 2. API — `src/app/api/**/route.ts`
- Route Handlers do Next.js.
- Cada arquivo exporta `GET`, `POST`, `PATCH`, `DELETE` conforme necessário.
- Sempre retornam `ApiResult<T>` para consistência.
- Sempre validam permissão (`getCurrentUser` + helper de perfil) quando a rota é administrativa.

### 3. Domínio — `src/lib/`
- `db.ts`: singleton Prisma.
- `session.ts`: criação/verificação de sessão JWT + helpers de permissão.
- `praise.ts`: utilidades de domínio (slug, datas, status, próximo culto).
- `utils.ts`: `cn` (tailwind-merge).

### 4. Componentes — `src/components/`
- `ui/`: shadcn/ui (gerados, não editar diretamente).
- `praisehub/`: componentes próprios. Sempre prefixados com `praisehub/` ao importar.

### 5. Tipos — `src/types/index.ts`
- DTOs que cruzam a fronteira API ↔ cliente.
- Espelham parcialmente os modelos Prisma.

## Autenticação

```
[Login form]
    │
    ▼
POST /api/auth/login
    │ bcrypt.compare(senha, user.senhaHash)
    │ ✓ → createSession({ uid, email, nome, perfil })
    │     → setSessionCookie(token, httpOnly)
    │     → return ProfileDTO
    │ ✗ → 401
    ▼
[Cookie praisehub_session assinado com JWT HS256, 7 dias]
    │
    ▼
Em cada request administrativo:
    │ getCurrentUser() → verifica cookie → busca Profile no banco
    │ → valida status="ativo" + perfil permitido
```

## Permissões (matriz)

Definidas em `src/lib/session.ts`. Ver `docs/permissions.md` para detalhes.

## Banco de dados

- Provider: SQLite (arquivo em `db/custom.db`).
- Migrations: `bun run db:push` em dev; `bun run db:migrate` em produção.
- Tipos: IDs são `cuid()`. Datas são `DateTime` (ISO 8601).
- Singletons: `ChurchSettings` com `id="singleton"`.

## Armazenamento de arquivos (Fase 3+)

Ainda não implementado. Plano:
- Local inicial: `public/uploads/adsa-praise/evento/tipo/identificador-versao.ext`.
- Em produção: Z.AI Storage ou Supabase Storage com URLs assinadas para arquivos privados.
- Ver `docs/storage.md`.

## Auditoria

Toda mutação administrativa cria um `AuditLog`:
- `acao`: criar, atualizar, publicar, arquivar, restaurar, excluir.
- `entidade` + `entidadeId`: o que foi alterado.
- `dadosAnteriores` + `dadosPosteriores`: JSON diff.
- `usuarioId`: quem fez.
- `criadoEm`: quando.

## Migrations futuras

### Para Supabase (recomendado na Fase 3+)
1. Criar projeto Supabase.
2. Rodar SQL equivalente ao `schema.prisma` (usar `prisma migrate diff`).
3. Trocar `DATABASE_URL` para a connection string do Supabase.
4. Trocar `provider` no `schema.prisma` de `sqlite` para `postgresql`.
5. Habilitar Row Level Security nas tabelas sensíveis.
6. Migrar auth para NextAuth + Supabase Adapter (ou manter JWT com Supabase Auth).
7. Migrar storage para Supabase Storage com URLs assinadas.

### Para PostgreSQL puro
Mesma migração, sem o passo de storage.

## Performance

- Turbopack em dev.
- Server Components reduzem JavaScript enviado ao cliente.
- Imagens: `<img loading="lazy">` em cards. Na Fase 4, usar `next/image` para otimização.
- Banco: índices em `Profile.perfil`, `Profile.status`, `Event.status`, `Event.visibilidade`, `Event.data`, `Event.destaqueManual`, `AuditLog.criadoEm`.
- Sem cache HTTP agressivo ainda (tudo `cache: "no-store"` em fetches administrativos).
