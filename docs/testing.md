# docs/testing.md — Estratégia de Testes

## Status atual (Fase 1+2)

Ainda **não há** testes automatizados. A verificação foi manual via Agent Browser:

- Login com credenciais padrão.
- Criação de evento completo.
- Publicação de evento.
- Listagem pública.
- Detalhe do evento.
- Histórico com filtro por ano.
- Dashboard administrativo.
- Edição de configurações.
- Layout responsivo em 412×915 (mobile) e 1440×900 (desktop).

## Planejamento (Fase 7)

### 1. Testes unitários

Framework: **Vitest** ou **Bun test**.

Cobrir:
- Cálculo do próximo culto (`selecionarProximoCulto`).
- Prioridade do destaque manual.
- Regras de status.
- Padronização de nomes (`slugify`, `uniqueSlug`).
- Permissões (`canManageEvents`, `canApprove`, etc.).
- Validação de arquivos (Fase 3).
- Expiração dos links de contribuição (Fase 5).
- Mudança de versão oficial (Fase 3).

### 2. Testes de integração

Cobrir:
- Banco de dados (criar, ler, atualizar, arquivar).
- Autenticação (login, logout, sessão expirada).
- Upload (Fase 3).
- Políticas de acesso (RLS quando migrar para Supabase).
- Publicação (transição de status).
- Download (Fase 3).
- Auditoria (registro correto em mutações).
- Exclusão lógica vs. definitiva (Fase 6).
- Restauração (Fase 6).

### 3. Testes ponta a ponta (E2E)

Framework: **Playwright**.

Cenários obrigatórios (spec 23.3):

#### Cenário 1 — Criar e publicar culto
1. Admin entra em `/login`.
2. Faz login.
3. Vai para `/admin/eventos/novo`.
4. Preenche nome, categoria, data, horário, local, tema, pregador.
5. Salva como rascunho.
6. Edita e publica.
7. Evento aparece como próximo culto na home.
8. Visitante (modo anônimo) baixa os materiais (quando Fase 3 estiver implementada).

#### Cenário 2 — Corrigir arte
1. (Fase 3) Versão 1 publicada.
2. Admin sobe versão 2.
3. Aprovador aprova versão 2.
4. Versão 2 vira oficial.
5. Versão 1 permanece no histórico.

#### Cenário 3 — Galeria
1. (Fase 4) Admin cria álbum vinculado a um evento.
2. Sobe várias fotos.
3. Escolhe capa.
4. Publica álbum.
5. Visitante visualiza.
6. Download funciona conforme permissão.

#### Cenário 4 — Contribuição
1. (Fase 5) Admin ativa "Receber fotos deste culto".
2. Sistema gera link com token.
3. Colaborador acessa pelo celular (sem login).
4. Envia 3 fotos.
5. Fotos entram como pendentes.
6. Admin aprova 2 e rejeita 1.
7. Apenas as 2 aprovadas aparecem no álbum.

#### Cenário 5 — Segurança
1. Usuário não autenticado tenta acessar `/admin/dashboard` → redirecionado para `/login`.
2. Usuário não autenticado tenta `GET /api/events?status=rascunho` → recebe apenas publicados.
3. Usuário não autenticado tenta `POST /api/events` → 403.
4. Link de contribuição expirado → 410 Gone.
5. Editor tenta acessar `/admin/configuracoes` → pode ver, mas `PATCH` retorna 403.

### 4. Navegadores

Testar em (spec 23.4):
- Chromium (Playwright default).
- Firefox.
- WebKit/Safari.

### 5. Mobile

Executar cenários principais em emulação (spec 23.5):
- iPhone 12 (390×844).
- Pixel 5 (412×915).
- iPad (768×1024).

### 6. Teste visual

Framework: **Playwright visual comparisons**.

Gerar capturas de referência das páginas principais:
- `/` (home).
- `/eventos`.
- `/eventos/[slug]`.
- `/historico`.
- `/login`.
- `/admin/dashboard`.
- `/admin/eventos`.
- `/admin/eventos/novo`.
- `/admin/configuracoes`.

Detectar regressões:
- Componentes desalinhados.
- Textos cortados.
- Rolagem horizontal indevida.
- Sobreposição.
- Modais fora da tela.
- Botões inacessíveis.
- Imagens deformadas.

### 7. Acessibilidade

Ferramentas: **axe-core** (via Playwright) + **Lighthouse Accessibility audit**.

Validar (spec seção 22):
- Contraste mínimo 4.5:1.
- Alt text em todas as imagens.
- Rótulos em todos os campos de formulário.
- Navegação por teclado (Tab, Enter, Esc, Shift+Tab).
- Foco visível.
- Ordem de foco lógica.
- Leitor de tela (NVDA/VoiceOver).
- Mensagens de erro associadas aos campos (`aria-describedby`).
- Botões com `aria-label` quando não têm texto.
- Diálogos com foco controlado (focus trap).
- Fechamento por teclado (Esc).
- `prefers-reduced-motion` respeitado.
- Não depender somente de cor para transmitir informação.

Meta: **Lighthouse Accessibility ≥ 95** (spec 21.3).

### 8. Performance

Ferramenta: **Lighthouse CI**.

Metas (spec 21.3):
- Acessibilidade ≥ 95.
- Boas práticas ≥ 90.
- SEO ≥ 90 nas páginas públicas.
- Performance mobile ≥ 85 (quando tecnicamente viável).

Otimizações:
- Imagens responsivas (`next/image`).
- Lazy loading em galerias.
- Minificação e code-splitting (automático no Next.js).
- Cache de queries pesadas (Fase 6).

## CI/CD (Fase 7)

Pipeline no GitHub Actions:

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run lint
  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:unit
  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run db:push
      - run: bun run scripts/seed.ts
      - run: bun run test:e2e
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun run start &
      - run: bunx @lhci/cli autorun
```

## Cobertura alvo

| Camada | Cobertura |
|--------|-----------|
| `lib/praise.ts` | ≥ 90% |
| `lib/session.ts` | ≥ 90% |
| APIs administrativas | ≥ 80% |
| Componentes ADSA Reimberg Mídias | ≥ 70% |
| E2E cenários spec | 5/5 |

## Quando rodar

- **Local**: antes de cada commit (`bun run lint && bun run test`).
- **CI**: em cada push e PR.
- **Staging**: deploy automático após CI verde.
- **Produção**: smoke tests após deploy.
