# ADR-001 — Stack escolhida

**Data**: 2026-08-01
**Status**: Aceito
**Decisor**: Agente principal (especificação master)

## Contexto

A especificação master (seção 17.1) recomenda:
- Next.js ou framework React equivalente.
- TypeScript em modo estrito.
- Tailwind CSS.
- shadcn/ui ou componentes acessíveis equivalentes.
- Banco PostgreSQL.
- Autenticação integrada.
- Armazenamento de objetos.

O sandbox Z.AI oferece:
- Next.js 16 + TypeScript.
- Tailwind 4 + shadcn/ui.
- Prisma ORM com SQLite (não PostgreSQL).
- NextAuth v4 disponível.

## Decisão

Adotar a stack do sandbox:
- **Next.js 16** (App Router, Turbopack).
- **TypeScript 5** estrito.
- **Tailwind CSS 4** + **shadcn/ui** (New York).
- **Prisma 6** + **SQLite** (em `db/custom.db`).

## Alternativas consideradas

1. **Migrar para PostgreSQL imediatamente**: exige provisionar instância externa, fora do escopo atual.
2. **Usar NextAuth desde o início**: mais setup, sem benefício claro para Fase 1+2.

## Consequências

- ✅ Stack alinha com spec em 6 dos 8 pontos.
- ✅ Persistência real garantida pelo SQLite em arquivo local.
- ⚠️ Quando Supabase estiver disponível, migrar banco e auth (spec 17.3).
- ⚠️ Algumas queries Prisma podem diferir entre SQLite e PostgreSQL (ex: `String?` vs `text`).
- 📝 Documentar esta decisão no `README.md` e `docs/architecture.md`.

## Próxima revisão

Na Fase 3 (Central de Artes), quando precisarmos de storage de arquivos, reavaliar migração para Supabase.
