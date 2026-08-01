# ADR-003 — Renomeação para ADSA Reimberg Mídias

**Data**: 2026-08-02
**Status**: Aceito
**Decisor**: Usuário (solicitação direta)

## Contexto

A aplicação foi inicialmente chamada de "PraiseHub" (nome do produto) com a igreja referida como "ADSA Praise" (entidade). A especificação master original usava esses nomes.

O usuário solicitou a renomeação para "ADSA Reimberg Mídias" — o que sugere que:
- A igreja real é "ADSA Reimberg" (não "ADSA Praise" como estava na spec).
- O nome do produto/sistema é "ADSA Reimberg Mídias".

## Decisão

Renomear toda a aplicação:

| Antes | Depois |
|-------|--------|
| PraiseHub | ADSA Reimberg Mídias |
| ADSA Praise | ADSA Reimberg |
| Central de Mídia ADSA Praise | Central de Mídia ADSA Reimberg |
| Administrador PraiseHub (nome do admin) | Administrador ADSA Reimberg |
| Templo ADSA Praise (local demo) | Templo ADSA Reimberg |

## Preservado

Itens mantidos por razões técnicas (não exigem mudança e/ou migration seria disruptiva):

- **E-mail do admin**: `admin@adsapraise.org` — identificador interno usado para login. Mudar exigiria re-criar o usuário e re-invalidar sessões. Pode ser alterado via UI na Fase 6.
- **Senha padrão**: `praisehub2026` — apenas credencial inicial.
- **Variáveis de ambiente**: `PRAISEHUB_SESSION_SECRET`, `PRAISEHUB_ADMIN_PASSWORD` — nomes internos, sem impacto visual.
- **Nome do cookie**: `praisehub_session` — nome interno no navegador do usuário.
- **Pasta de componentes**: `src/components/praisehub/` — estrutura de arquivos interna; renomear exigiria refator de imports.
- **Tokens CSS**: `--praise-deep`, `--praise-gold`, `--praise-soft` — usados em muitos componentes; renomear traria risco de regressão visual sem benefício.
- **Classe utilitária**: `.praise-touch`, `.praise-container`, etc. — mesmo motivo.

## Consequências

- ✅ Toda a interface do usuário exibe "ADSA Reimberg Mídias" / "ADSA Reimberg" consistentemente.
- ✅ Metadata HTML, OpenGraph e títulos das páginas atualizados.
- ✅ Documentação (README, AGENTS, docs/*) alinhada.
- ✅ Banco de dados existente migrado via script.
- ⚠️ Identificadores internos (email, env vars, cookie name) permanecem "praisehub" — aceitável pois não são visíveis ao usuário final.
- ⚠️ Futuras migrations devem lembrar de usar os novos nomes nas mensagens de log e comentários.

## Implementação

- `scripts/rename_to_reimberg.ts`: atualiza banco existente (idempotente).
- `scripts/rename_docs.py`: substitui nomes em arquivos `.md` (preserva email, senha, env vars, nome do cookie, caminhos de arquivo e tokens CSS).
- Substituições manuais em arquivos `.ts` / `.tsx` para textos visíveis ao usuário.
