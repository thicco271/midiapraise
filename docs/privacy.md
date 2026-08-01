# docs/privacy.md — Privacidade e Proteção de Dados

## Princípios

1. **Minimização**: coletar apenas o necessário para a funcionalidade.
2. **Transparência**: informar claramente o uso dos dados.
3. **Consentimento**: para conteúdo contribuído, exigir aceite explícito.
4. **Segurança por padrão**: criptografia em trânsito (HTTPS), senhas com hash, sessões httpOnly.
5. **Não uso para treinamento**: fotos, dados pessoais e arquivos nunca serão usados para treinar modelos de IA (spec 4.7).

## Dados coletados

### Dos usuários autenticados (administradores, editores, etc.)
- Nome.
- E-mail.
- Senha (apenas hash bcrypt, nunca texto plano).
- Perfil (role).
- Status (ativo/suspenso/inativo).
- Avatar (URL opcional).
- Último acesso (timestamp).
- Data de criação.

### Dos visitantes públicos
- Nenhum dado pessoal é coletado ativamente.
- Logs de servidor padrão (IP, User-Agent) podem ser coletados pela infraestrutura, mas não são usados para identificação.

### Dos convidados para upload (Fase 5)
- Nome do colaborador (informado voluntariamente).
- Contato opcional (telefone ou e-mail).
- Aceite das regras de envio.
- Fotos enviadas.

## Uso dos dados

### Finalidades legítimas
- Autenticação e controle de acesso.
- Auditoria de ações administrativas.
- Exibição pública de eventos e materiais publicados.
- Moderação de contribuições.

### Proibições
- Vender dados a terceiros.
- Compartilhar com terceiros sem consentimento (exceto obrigação legal).
- Usar fotos para reconhecimento facial (spec 10.8).
- Usar fotos para identificação automática de pessoas (spec 10.8).
- Treinar modelos com fotos ou dados pessoais (spec 4.7).

## Fotos de crianças (spec 10.8, 10.9)

- Moderação obrigatória reforçada para fotos contendo crianças.
- Publicação exige revisão administrativa dupla.
- Verbalização do consentimento dos responsáveis é necessária antes da publicação.
- Sugestão: marcar fotos com `visibilidade=privado` por padrão quando houver crianças.

## Metadados de arquivos

- **EXIF GPS**: REMOVER de todos os arquivos publicados (spec 10.8).
- **EXIF câmera/software**: REMOVER.
- **Dimensões/orientação**: manter se necessário para exibição.

Implementação: ver `docs/storage.md` seção "Remoção de metadados sensíveis".

## Direitos do titular

### Solicitação de remoção
Qualquer pessoa pode solicitar a remoção de:
- Foto sua publicada no ADSA Reimberg Mídias.
- Dado pessoal incorreto.
- Contribuição enviada (mesmo já publicada).

Implementação (Fase 5+):
- Formulário em `/privacidade/solicitar-remocao`.
- Solicitação entra na tabela `ProductFeedback` com `categoria=remocao`.
- Admin revisa e executa em até 7 dias.
- Remoção física do arquivo + registro de auditoria.

### Exportação de dados
A ser implementado na Fase 6:
- Usuário autenticado pode exportar seus próprios dados (nome, e-mail, perfil, atividade).
- Formato JSON.

## Cookies

Apenas um cookie de sessão:
- Nome: `praisehub_session`.
- Tipo: httpOnly, SameSite=Lax.
- Conteúdo: JWT assinado com HS256.
- Validade: 7 dias.
- Não rastreia navegação em outros sites.

## Logs

### Logs de aplicação
- Erros e warnings (Prisma log `['warn', 'error']`).
- Não registram dados pessoais sensíveis.

### Logs de auditoria
- Ações administrativas (criar, editar, excluir).
- `usuarioId`, `acao`, `entidade`, `entidadeId`, `descricao`.
- `dadosAnteriores` / `dadosPosteriores` (JSON diff).
- `ip` (apenas quando explicitamente permitido pela política, padrão: null).
- Retenção: indefinida (necessária para auditoria).

## Segurança técnica

- Senhas: bcrypt com 12 rounds.
- Sessão: JWT HS256 com secret em variável de ambiente (`PRAISEHUB_SESSION_SECRET`).
- HTTPS obrigatório em produção.
- Cookies httpOnly + SameSite=Lax.
- Validação de uploads (tipo real, tamanho, dimensões) — Fase 3.
- Limitação de tentativas de login — Fase 6.
- Proteção contra CSRF: SameSite=Lax + verificação de origem em mutações — Fase 6.

## Conformidade

O ADSA Reimberg Mídias segue os princípios da LGPD (Lei Geral de Proteção de Dados, Brasil):

- Base legal: legítimo interesse para operação da igreja.
- Finalidade: gerenciamento de mídia para divulgação de cultos.
- Necessidade: apenas dados essenciais.
- Transparência: esta documentação é pública para os usuários.
- Segurança: técnicas listadas acima.
- Não discriminação: não há decisões automatizadas com base nos dados.

Para dúvidas de privacidade: contactar o administrador da ADSA Reimberg.
