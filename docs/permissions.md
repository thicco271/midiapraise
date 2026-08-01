# docs/permissions.md — Perfis e Permissões

## Visão geral

O ADSA Reimberg Mídias implementa RBAC (Role-Based Access Control) com 6 perfis. As permissões são verificadas SEMPRE no backend, nunca apenas por ocultação de botões no frontend.

## Perfis

### administrador
Pode tudo: criar/editar/excluir eventos, publicar, aprovar, gerenciar usuários, alterar configurações, consultar auditoria, restaurar conteúdos, gerar backups.

### editor
Pode criar/editar eventos, subir artes (Fase 3), criar álbuns (Fase 4), enviar para aprovação. **Não** pode alterar administradores, regras de segurança, excluir definitivamente ou publicar sem aprovação quando o fluxo está ativo.

### aprovador
Pode revisar artes, aprovar, reprovar, solicitar ajustes, publicar conteúdos aprovados.

### fotografo
Pode criar rascunhos de álbuns, enviar fotos, informar data e evento, acompanhar próprio envio. Fotos entram em fila de revisão.

### equipe_midia
Pode consultar artes, baixar arquivos, consultar álbuns liberados, copiar links, consultar histórico.

### visitante
Pode consultar eventos publicados, baixar artes públicas, visualizar álbuns públicos, usar links de compartilhamento.

## Matriz de permissões (Fase 1+2)

| Ação | admin | editor | aprovador | fotografo | equipe_midia | visitante |
|------|:-----:|:------:|:---------:|:---------:|:------------:|:---------:|
| Acessar `/admin/*` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Ver dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Criar evento | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Editar evento | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Arquivar evento | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Publicar evento | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| Definir destaque manual | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Alterar configurações | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Consultar auditoria | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver página pública | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Editor pode publicar diretamente quando o fluxo de aprovação está desativado (padrão atual).

## Helpers de permissão (em `src/lib/session.ts`)

```typescript
canManageEvents(perfil)  // admin, editor
canApprove(perfil)       // admin, aprovador
canAccessAdmin(perfil)   // qualquer um menos visitante
canEditSettings(perfil)  // admin
```

## Implementação

### Server Components / Route Handlers
```typescript
import { getCurrentUser, canManageEvents } from "@/lib/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json({ ok: false, error: "Sem permissão" }, { status: 403 });
  }
  // ... lógica
}
```

### Client Components (guarda de rota)
```tsx
import { AdminGuard } from "@/components/praisehub/admin-guard";

export default function AdminPage() {
  return (
    <AdminGuard>
      {/* conteúdo só renderiza se autenticado e não-visitante */}
    </AdminGuard>
  );
}
```

### Server Components (renderização condicional)
```tsx
import { getCurrentUser } from "@/lib/session";

export default async function Page() {
  const user = await getCurrentUser();
  return (
    <div>
      {user && canEditSettings(user.perfil) && <Button>Editar configurações</Button>}
    </div>
  );
}
```

## Convidado para upload (Fase 5)

Não é um perfil persistente. É um token temporário com:
- Evento vinculado.
- Data de expiração.
- Limite de arquivos.
- Limite de tamanho.
- Possibilidade de revogação.
- Código seguro.

Esse token permite enviar fotos sem criar conta. Fotos entram como "Aguardando revisão" — nunca publicadas automaticamente.

## Proteção do último administrador

O sistema deve impedir a remoção do último administrador ativo. Implementação: na Fase 6, ao tentar desativar/excluir um perfil `administrador` com `status=ativo`, verificar se existe outro. Se não, bloquear com erro.

## Auditoria de permissões

Toda mutação administrativa gera `AuditLog` com `usuarioId` + `acao` + `entidade` + `dadosPosteriores`. Visível em `/admin/auditoria` (a ser construído na Fase 6).
