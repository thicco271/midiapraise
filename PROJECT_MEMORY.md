# PROJECT_MEMORY — ADSA Reimberg Mídias

> Memória persistente do projeto. Decisões, aprendizados e regras permanentes.

## Regras permanentes (NÃO podem ser flexibilizadas silenciosamente)

1. **Mobile-first**: toda tela é desenhada primeiro para celular, depois adaptada para tablet/desktop.
2. **Persistência real**: dados e arquivos não somem após reload. SQLite em `db/custom.db` é a fonte da verdade atual.
3. **Não apagar dados**: exclusão é lógica (status=`arquivado`). Exclusão física exige confirmação dupla.
4. **Não publicar fotos automaticamente**: qualquer contribuição externa entra em fila de moderação.
5. **Paleta oficial**: azul profundo (#0F2A5C) + dourado suave (#C9A227) + branco + cinzas. Configurável em `/admin/configuracoes`.
6. **Aprovação obrigatória**: quando o fluxo de aprovação estiver ativo, nada é publicado sem revisão.
7. **Manter histórico**: toda alteração relevante gera `AuditLog`.
8. **Sem funções decorativas**: todo botão visível executa ação real. Se uma função não está implementada, ela é removida da UI ou marcada como "Fase X".
9. **Permissões no backend**: nunca confiar apenas em ocultar botões. Toda API valida `getCurrentUser()` + helper de perfil.
10. **Fuso America/Sao_Paulo**: todas as datas são formatadas neste fuso.

## Decisões técnicas (ADR resumido)

### ADR-001 — Stack escolhida (2026-08-01)
**Status**: Aceito
**Contexto**: spec recomenda Next.js + TS + Tailwind + shadcn + PostgreSQL. Sandbox oferece Prisma+SQLite.
**Decisão**: Usar Next.js 16 + TS + Tailwind 4 + shadcn/ui (alinhado à spec) + Prisma+SQLite (adaptação do ambiente).
**Consequências**: Quando Supabase estiver disponível, migrar banco e auth (spec 17.3). Código deve permanecer agnóstico ao máximo.

### ADR-002 — Sessão JWT própria (2026-08-01)
**Status**: Aceito
**Contexto**: NextAuth v4 está disponível, mas configurá-lo com credentials exige adapter Prisma e tabela de sessão.
**Decisão**: Implementar sessão JWT simples com `jose` em cookie httpOnly. Hash de senha com bcryptjs (12 rounds).
**Consequências**: Migração para NextAuth na Fase 6. Não há refresh token ainda — token expira em 7 dias.

### ADR-003 — Slug sem data por padrão (2026-08-01)
**Status**: Aceito
**Contexto**: Spec sugere `2026-08-02_Culto-da-Familia_Status-WhatsApp_v2.png` como padrão de nome de arquivo. Mas para URLs amigáveis, slug com data é verboso.
**Decisão**: Slug = `slugify(nome)` + sufixo `-2`, `-3` em colisão. Evento demo usa slug manual com data (`culto-da-familia-2026-08-09`).
**Consequências**: URLs ficam limpas. Padrão de arquivo com data será aplicado apenas nos downloads (Fase 3).

### ADR-004 — Datas como local, não UTC (2026-08-01)
**Status**: Aceito
**Contexto**: `<input type="date">` retorna `YYYY-MM-DD`. `new Date("2026-08-19")` interpreta como UTC midnight, que em America/Sao_Paulo vira 21:00 do dia anterior.
**Decisão**: Em `formatarData` (cliente) e nas APIs (criar/editar evento), interpretar `YYYY-MM-DD` como data local combinada com `horarioInicio`.
**Consequências**: Datas aparecem corretas no fuso do usuário. Se o app for usado em outro fuso, ainda funciona porque a data é armazenada como local-br.

### ADR-005 — Exclusão lógica (2026-08-01)
**Status**: Aceito
**Contexto**: Spec diz "exclusão em duas fases: lixeira/exclusão lógica + exclusão definitiva confirmada".
**Decisão**: `DELETE /api/events/[id]` apenas marca `status=arquivado`. Exclusão física será implementada na Fase 6 com confirmação dupla.

## Aprendizados

### 2026-08-01 — Server Component com handler de evento
**Problema**: Página `/historico` quebrou com erro "Event handlers cannot be passed to Client Component props".
**Causa**: Tinha `<select onChange={...}>` dentro de um Server Component.
**Solução**: Extrair o `<select>` para um Client Component separado (`AnoFiltro`).
**Lição**: Sempre que precisar de `onClick`/`onChange` em um elemento, o componente pai deve ser `"use client"` OU o elemento deve ser extraído para um Client Component.

### 2026-08-01 — Logs Prisma poluem dev.log
**Problema**: `dev.log` crescia indefinidamente com `prisma:query SELECT ...` a cada request.
**Causa**: `PrismaClient({ log: ['query'] })` registra todas as queries.
**Solução**: Mudar para `log: ['warn', 'error']`.

### 2026-08-01 — Date picker do shadcn não preenche input
**Problema**: No formulário de evento, clicar no calendário não atualizava o `<input type="date">`.
**Causa**: O Calendar do shadcn é apenas visual; o `<input type="date">` é nativo e separado.
**Solução**: Em testes E2E, preencher o `<input type="date">` diretamente via JS: `setter.call(el, '2026-08-19'); el.dispatchEvent(new Event('input', {bubbles:true}))`.
**Lição**: Considerar substituir o `<input type="date">` nativo por um DatePicker integrado na Fase 3.

## Pendências conhecidas

- [ ] Fase 3 — Upload real de arquivos (multer ou endpoint chunked)
- [ ] Fase 3 — Versionamento de artes (`MediaAsset` + `MediaVersion`)
- [ ] Fase 3 — Fluxo de aprovação visual
- [ ] Fase 3 — Download em ZIP
- [ ] Fase 4 — Galeria de fotos (`Album` + `AlbumPhoto`)
- [ ] Fase 4 — Upload em massa com drag&drop
- [ ] Fase 5 — Link de contribuição com token seguro
- [ ] Fase 5 — Moderação de fotos colaborativas
- [ ] Fase 6 — Recuperação de senha
- [ ] Fase 6 — Backup/exportação
- [ ] Fase 6 — Visualização de auditoria na UI
- [ ] Fase 7 — Testes E2E com Playwright
- [ ] Fase 7 — Testes de acessibilidade (axe-core)
- [ ] Fase 7 — Lighthouse CI

## Feedback dos usuários

Ainda não há feedback registrado. Quando houver, será armazenado na tabela `ProductFeedback` e revisado manualmente pelo administrador em `/admin/feedback` (a ser construído na Fase 6).

## Proteção de dados

- Nenhuma foto, dado pessoal ou arquivo enviado por usuários é usado para treinar modelos.
- Senhas são armazenadas apenas como hash bcrypt (nunca em texto plano, nunca em logs).
- Tokens de sessão são assinados com `PRAISEHUB_SESSION_SECRET` (variável de ambiente).
- Logs de auditoria não registram senhas, apenas metadados (ação, entidade, descrição, dados anteriores/posteriores).
