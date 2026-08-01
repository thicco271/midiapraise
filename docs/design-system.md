# docs/design-system.md — Design System ADSA Reimberg Mídias

## Direção visual

A interface deve ser:

- Moderna e organizada.
- Acolhedora e ministerial.
- Elegante, clara, visualmente leve.
- Fácil para pessoas com pouca familiaridade digital.

## Evitar

- Excesso de efeitos.
- Poluição visual.
- Gradientes exagerados.
- Elementos piscando.
- Carrosséis automáticos.
- Ícones sem significado.
- Aparência de sistema empresarial antigo.
- Aparência infantil fora dos módulos infantis.

## Paleta de cores

Definida em `src/app/globals.css` como CSS variables.

### Tokens primitivos

| Token | Valor | Uso |
|-------|-------|-----|
| `--praise-deep` | `#0F2A5C` | Azul profundo — cor primária |
| `--praise-gold` | `#C9A227` | Dourado suave — destaque |
| `--praise-soft` | `#F6F2E7` | Creme claro — realce suave |

### Tokens semânticos (Light)

| Token | Valor | Mapeado de |
|-------|-------|------------|
| `--background` | `#FFFFFF` | — |
| `--foreground` | `#1A2238` | — |
| `--primary` | `#0F2A5C` | `--praise-deep` |
| `--primary-foreground` | `#FFFFFF` | — |
| `--secondary` | `#F6F2E7` | `--praise-soft` |
| `--muted` | `#F4F5F7` | — |
| `--muted-foreground` | `#5B6478` | — |
| `--accent` | `#EDE3C2` | dourado claro |
| `--ring` | `#C9A227` | `--praise-gold` |
| `--border` | `#E2E6EE` | — |
| `--destructive` | `#B91C1C` | vermelho |

### Tokens semânticos (Dark)
Definidos em `.dark`. Paleta escura com azul marinho (`#0B1530`) + dourado mantido.

## Tipografia

- **Família**: Geist Sans (carregada via `next/font/google`).
- **Tamanho base**: 16px.
- **Hierarquia**:
  - `.praise-title`: 2xl/3xl/4xl bold + serif fallback
  - `.praise-subtitle`: base/lg muted-foreground
  - `.praise-eyebrow`: xs uppercase tracking-widest text-praise-gold
- **Altura de linha**: 1.5 para corpo.
- **Não usar**: textos minúsculos para informações importantes.

## Espaçamento

- Container: `praise-container` = `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`.
- Container estreito: `praise-container-narrow` = `max-w-3xl`.
- Padding de cards: `p-4` ou `p-6`.
- Gap em grids: `gap-4` ou `gap-6`.

## Bordas e raios

- `--radius`: `0.625rem` (10px).
- `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full` conforme contexto.
- Cards: `rounded-xl`.
- Botões: `rounded-md`.
- Badges: `rounded-full`.

## Sombras

- `shadow-sm`: cards em repouso.
- `shadow-md`: hover.
- `shadow-xl`, `shadow-2xl`: hero e destaques.

## Componentes (regras de uso)

### Botões
- Touch mínimo: 48×48px (`.praise-touch`).
- Variante padrão: `bg-primary text-primary-foreground`.
- Variante outline: `border border-input bg-background`.
- Variante ghost: `hover:bg-accent`.
- Estados: normal, hover, focus-visible (ring), disabled (opacity-50).
- Ícone à esquerda do texto.

### Cards
- `.praise-card`: `rounded-xl border bg-card shadow-sm hover:shadow-md`.
- Capa: `aspect-video` ou `aspect-[16/9]`.

### Formulários
- Labels acima dos inputs.
- Inputs com `praise-touch` (48px altura).
- Ícones decorativos com `pointer-events-none absolute left-3`.
- Erros: `border-destructive` + mensagem abaixo.
- Foco visível: `ring-2 ring-ring ring-offset-2`.

### Badges de status
- `STATUS_COLOR[status]` em `src/lib/praise.ts`.
- Sempre `border-0` + fundo colorido suave.

### Badges de destaque
- Dourado: `bg-praise-gold/20 text-praise-gold`.

## Acessibilidade

- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande.
- Foco visível sempre.
- `aria-label` em botões sem texto.
- `aria-hidden="true"` em ícones decorativos.
- `prefers-reduced-motion` desativa animações.
- Navegação por teclado funcional (Tab, Enter, Esc).

## Responsividade

### Breakpoints
- `sm`: 640px (telefone grande).
- `md`: 768px (tablet).
- `lg`: 1024px (desktop).
- `xl`: 1280px.

### Grids por breakpoint
| Container | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Cards de evento | 1 col | 2 cols | 3 cols |
| Dashboard cards | 1 col | 2 cols | 4 cols |
| Formulários | 1 col | 2 cols | 2 cols |

### Áreas de toque
- Mínimo 48×48px em todos os botões clicáveis.
- `.praise-touch` utility class.
- Gap mínimo entre botões: 8px.

### Viewports testadas
- 360×800
- 390×844
- 412×915
- 768×1024
- 1024×768
- 1366×768
- 1440×900
