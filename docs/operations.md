# docs/operations.md — Operação e Manutenção

## Deploy

### Ambiente atual (sandbox Z.AI)
- Servidor: `bun run dev` em porta 3000.
- Banco: SQLite em `db/custom.db` (arquivo local).
- Logs: `dev.log` (rotativo manualmente).
- Sem variáveis de ambiente sensíveis além de `DATABASE_URL` e `PRAISEHUB_SESSION_SECRET`.

### Produção (quando migrar)
1. **Banco**: PostgreSQL (Supabase ou outro).
2. **Storage**: Supabase Storage ou Z.AI Storage.
3. **Auth**: NextAuth + Supabase Adapter OU manter JWT com Supabase Auth.
4. **CDN**: Vercel ou Cloudflare Pages.
5. **Variáveis de ambiente**:
   - `DATABASE_URL`
   - `PRAISEHUB_SESSION_SECRET` (≥ 32 chars aleatórios)
   - `NEXTAUTH_SECRET` (se usar NextAuth)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`

## Backup

### Frequência
- Diário (automático em produção).
- Manual antes de migrações de schema.

### O que incluir
- Banco de dados completo (`db/custom.db` ou dump SQL).
- Arquivos em `public/uploads/` (Fase 3+).
- `.env` (em local seguro, não no repositório).
- `prisma/schema.prisma`.

### Como fazer (dev)
```bash
# Backup manual do SQLite
cp /home/z/my-project/db/custom.db /home/z/my-project/db/backup-$(date +%Y%m%d).db

# Backup de arquivos (Fase 3+)
tar -czf /home/z/my-project/backups/uploads-$(date +%Y%m%d).tar.gz public/uploads/
```

### Como fazer (produção)
- Supabase: snapshots automáticos diários + manual via dashboard.
- Storage: replicação para bucket secundário.

## Restauração

### SQLite (dev)
```bash
# Parar servidor
# Restaurar
cp /home/z/my-project/db/backup-20260801.db /home/z/my-project/db/custom.db
# Reiniciar servidor
bun run dev
```

### PostgreSQL (produção)
- Via Supabase Dashboard: select snapshot → restore.
- Ou via `psql`: `pg_restore -d $DATABASE_URL backup.dump`.

## Atualização (deploy de nova versão)

### Passos
1. Backup do banco.
2. Pull da nova versão: `git pull origin main`.
3. Instalar deps: `bun install`.
4. Aplicar migrations: `bun run db:migrate` (produção) ou `bun run db:push` (dev).
5. Rodar seed se houver novos dados obrigatórios: `bun run scripts/seed.ts` (idempotente).
6. Build: `bun run build`.
7. Restart: `bun run start`.
8. Smoke test: acessar `/`, `/login`, fazer login, acessar `/admin/dashboard`.
9. Verificar `dev.log` / `server.log` por erros.

### Rollback
1. Identificar commit estável anterior.
2. `git checkout <commit>` (ou tag).
3. Reinstalar deps se necessário.
4. Restaurar backup do banco se houve migration destrutiva.
5. Restart.

## Monitoramento

### Métricas a observar
- Erros 500 em `/api/*` (acima de 1% = investigar).
- Tempo de resposta das páginas públicas (< 2s ideal).
- Uso de disco do SQLite e `public/uploads/`.
- Uso de memória do processo Node.

### Alertas
- Banco de dados inacessível.
- Falha em upload (Fase 3+).
- Falha em envio de e-mail (se implementado).
- Tentativas de login suspeitas (Fase 6).

### Logs importantes
- `dev.log` (dev) / `server.log` (produção).
- Prisma warnings/errors.
- Erros do Next.js (HydrationMismatch, etc.).

## Manutenção rotineira

### Semanal
- Revisar `AuditLog` por ações suspeitas.
- Revisar `ProductFeedback` pendente (Fase 6).
- Verificar eventos sem capa.
- Verificar eventos arquivados recentemente.

### Mensal
- Backup completo.
- Revisar usuários inativos (status=suspenso ou ultimoAcesso antigo).
- Atualizar dependências (`bun update`).
- Rodar `bun run lint` após updates.

### Trimestral
- Auditoria de segurança completa.
- Revisão de permissões de usuários.
- Atualização do CHANGELOG e PROJECT_MEMORY.
- Revisão do roadmap.

## Procedimento de recuperação de desastre

### Cenário 1 — Banco corrompido
1. Parar servidor.
2. Restaurar último backup válido: `cp db/backup-YYYYMMDD.db db/custom.db`.
3. Reiniciar servidor.
4. Verificar integridade: acessar `/admin/dashboard`, listar eventos.
5. Comunicar usuários sobre possível perda de dados desde o último backup.

### Cenário 2 — Arquivo deletado acidentalmente
1. Verificar se está em backup.
2. Se sim, restaurar do backup.
3. Se não, marcar registro como `status=arquivado` e notificar usuários.

### Cenário 3 — Senha admin esquecida
1. Acessar servidor via SSH.
2. Rodar script de reset (a criar na Fase 6):
   ```bash
   bun run scripts/reset_admin.ts
   ```
3. Script redefine senha para `praisehub2026` (ou valor configurável).
4. Admin deve alterar a senha no próximo login.

### Cenário 4 — Vazamento de secret
1. Imediatamente rotacionar `PRAISEHUB_SESSION_SECRET`.
2. Todas as sessões ativas são invalidadas (não dá mais para verificar JWT antigo).
3. Usuários precisam fazer login novamente.
4. Comunicar via canal oficial.

## Comunicação com usuários

### Canal oficial
- WhatsApp da equipe de mídia (para comunicação rápida).
- E-mail institucional (para comunicados formais).

### Quando comunicar
- Manutenção programada (com 24h de antecedência).
- Novas funcionalidades (após deploy).
- Incidentes que afetem uso (o mais rápido possível).
- Mudanças de política de privacidade (com 30 dias de antecedência).
