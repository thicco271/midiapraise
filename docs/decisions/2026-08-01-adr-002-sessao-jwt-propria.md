# ADR-002 — Sessão JWT própria ao invés de NextAuth

**Data**: 2026-08-01
**Status**: Aceito

## Contexto

Para Fase 1+2, precisamos de:
- Login com e-mail + senha.
- Cookie de sessão persistente.
- Verificação de perfil em cada request administrativo.

NextAuth v4 está disponível no sandbox, mas configurá-lo com credentials provider exige:
- Adapter Prisma (gera tabelas `User`, `Account`, `Session`, `VerificationToken`).
- Configuração de callbacks JWT.
- Mais arquivos de configuração.

## Decisão

Implementar sessão JWT própria:
- Hash de senha: **bcryptjs** (12 rounds).
- Token: **jose** (JWT HS256), 7 dias de expiração.
- Cookie: `praisehub_session`, httpOnly, SameSite=Lax, secure em produção.
- Secret: `PRAISEHUB_SESSION_SECRET` (variável de ambiente).

## Alternativas consideradas

1. **NextAuth + Credentials**: mais padrão, mais setup.
2. **Lucia Auth**: outra opção popular, mas exige adapter.
3. **Sem auth, só API key**: inadequado para múltiplos usuários.

## Consequências

- ✅ Setup simples (3 arquivos: `session.ts`, `login/route.ts`, `logout/route.ts`).
- ✅ Controle total sobre o payload do JWT (perfil embutido).
- ✅ Funciona com SQLite sem adapter.
- ⚠️ Sem refresh token: token expira em 7 dias, usuário precisa refazer login.
- ⚠️ Sem recuperação de senha ainda (Fase 6).
- ⚠️ Migração para NextAuth na Fase 6 exigirá invalidar todas as sessões existentes.

## Próxima revisão

Na Fase 6 (Administração avançada), quando implementarmos recuperação de senha, considerar migração para NextAuth + Resend/SMTP.
