# docs/storage.md — Estratégia de Armazenamento

## Status atual (Fase 1+2)

Ainda **não há** armazenamento de arquivos implementado. As únicas "imagens" no sistema são:

- URLs externas informadas manualmente (capa do evento, logo da igreja).
- Pré-visualização dessas URLs no formulário.

O upload real virá na **Fase 3 (Central de Artes)**.

## Planejamento (Fase 3+)

### Buckets / áreas

Conforme spec seção 19.1, separar em:

#### Conteúdo público
- Artes publicadas (`status=publicado`).
- Capas públicas.
- Miniaturas públicas.

#### Conteúdo privado
- Artes em rascunho.
- Versões anteriores.
- Fotos privadas.
- Envios aguardando aprovação.
- Originais protegidos.

### Convenção de caminhos

```
{igreja}/{evento}/{tipo}/{identificador-versao}.{extensao}
```

Exemplo:
```
adsa-praise/evt-2026-08-02/whatsapp/status-v2.png
adsa-praise/evt-2026-08-02/telao/banner-v1.jpg
adsa-praise/evt-2026-08-02/galeria/album-familia-001.jpg
```

### Implementação inicial (dev)

Em desenvolvimento, usar sistema de arquivos local:

```
public/uploads/adsa-praise/...
```

Acessível via `/uploads/adsa-praise/...`.

### Implementação produção

Recomendado: **Supabase Storage** ou **Z.AI Storage nativo** (quando disponível).

- Buckets: `public-assets`, `private-assets`.
- Arquivos públicos: URL direta.
- Arquivos privados: URL assinada com expiração (máximo 1h).
- Políticas de RLS no Supabase alinhadas às permissões do app.

### Tipos aceitos (spec 9.5)

| Tipo | Extensões | Observação |
|------|-----------|------------|
| Imagem | jpg, jpeg, png, webp, gif, heic, heif | HEIC/HEIF converter para jpg/png |
| Documento | pdf | |
| Vídeo | mp4 | |
| Arquivo compactado | zip | |

### Validações (spec 16.3)

- Tipo real do arquivo (magic bytes, não apenas extensão).
- Extensão.
- Tamanho máximo (configurável por bucket).
- Dimensões quando aplicável.
- Quantidade por lote.
- Nome seguro (sem path traversal).
- Arquivo corrompido (tentar abrir).
- Conteúdo incompatível (ex: PDF com extensão .jpg).

### Processamento (spec 16.4)

Para imagens públicas:
- Gerar miniaturas (thumbnail 400px, medium 800px, large 1200px).
- Gerar versão otimizada (WebP quando suportado).
- Preservar original quando necessário.
- Remover metadados de localização (GPS EXIF).
- Usar lazy loading na galeria.
- Não carregar originais pesados na grade.

### Exclusão (spec 19.4)

Duas fases:

1. **Lixeira / exclusão lógica**: marcar `status=arquivado`, manter arquivo físico.
2. **Exclusão definitiva**: após confirmação dupla, excluir registro E arquivo físico. Registrar em `AuditLog`.

### Pacotes ZIP (spec 9.8)

Para download de múltiplos arquivos:
- Selecionados individualmente.
- Todas as artes do culto.
- Somente redes sociais.
- Somente telão.
- Pacote completo.

Implementação: usar `archiver` no Node.js ou similar.

### Remoção de metadados sensíveis (spec 10.8)

Para fotos públicas:
- Strip EXIF (GPS, câmera, software).
- Manter apenas dimensões e orientação se necessário.
- Biblioteca: `sharp` (já disponível) ou `exiftool-vendored`.

### Proibições

- Não usar URLs públicas permanentes para arquivos privados.
- Não usar o repositório Git como armazenamento de fotos.
- Não registrar fotos/dados pessoais para treinar modelos (spec 4.7).
