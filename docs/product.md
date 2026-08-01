# docs/product.md — Visão de Produto

## Problema

A equipe de mídia da ADSA Praise gerencia artes oficiais (WhatsApp, redes sociais, telão), banners e fotos de cultos usando grupos de WhatsApp. Isso gera:

- Arquivos perdidos após scroll.
- Versões conflitantes (uma no grupo da liderança, outra no grupo de mídia).
- Dificuldade para encontrar materiais antigos.
- Sem controle de quem aprovou o quê.
- Fotos de cultos sem curadoria.
- Risco de privacidade (fotos de crianças, localização GPS).

## Solução

PraiseHub é a fonte oficial dos materiais de mídia. WhatsApp continua sendo usado para comunicação e compartilhamento de links, mas nunca como repositório.

## Personas

### 1. Administrador principal
- Define eventos, datas, horários, pregadores.
- Sobe artes, define destaque.
- Aprova/rejeita contribuições.
- Gerencia usuários e permissões.
- Consulta auditoria.

### 2. Editor de mídia
- Cria eventos (sem poder excluir definitivamente).
- Sobe artes para revisão.
- Edita textos de divulgação.

### 3. Aprovador
- Revisa artes antes da publicação.
- Pode pedir ajustes.

### 4. Fotógrafo / colaborador autorizado
- Cria rascunhos de álbuns.
- Envia fotos que entram em fila de moderação.

### 5. Equipe de mídia (consultivo)
- Baixa artes publicadas.
- Copia links para divulgação.
- Consulta histórico.

### 6. Visitante público
- Vê apenas eventos publicados como `visibilidade=publico`.
- Pode baixar artes públicas.

### 7. Convidado para upload (sem conta)
- Recebe um link temporário com token.
- Pode enviar fotos para um evento específico.
- Fotos entram em moderação (nunca publicadas automaticamente).

## Jornadas principais

### Jornada 1 — Divulgar próximo culto
1. Admin cria evento em `/admin/eventos/novo`.
2. Preenche nome, data, horário, local, tema, pregador.
3. Salva como rascunho.
4. (Fase 3) Sobe arte de WhatsApp, redes sociais e banner.
5. Marca como "destaque manual" se quiser pular a seleção automática.
6. Publica.
7. Evento aparece na home.
8. Equipe de mídia copia o link e compartilha no WhatsApp.

### Jornada 2 — Corrigir arte errada
1. (Fase 3) Versão 1 está publicada com erro.
2. Editor sobe versão 2.
3. Aprovador revisa e aprova.
4. Versão 2 vira oficial; versão 1 fica no histórico.
5. Página pública mostra versão 2.

### Jornada 3 — Receber fotos de um culto
1. (Fase 5) Admin ativa "Receber fotos deste culto".
2. Sistema gera link com token, validade e limites.
3. Admin compartilha o link no WhatsApp.
4. Pessoas enviam fotos pelo celular (sem login).
5. Fotos entram como "Aguardando revisão".
6. Admin aprova/rejeita cada foto.
7. Aprovadas aparecem no álbum público.

### Jornada 4 — Consultar culto antigo
1. Membro da equipe acessa `/historico`.
2. Filtra por ano e busca pelo nome.
3. Encontra o culto desejado.
4. Visualiza materiais e álbuns (mesmo após anos).

## Métricas de sucesso

- Tempo para encontrar a arte do próximo culto: **< 5 segundos** (hoje: minutos no WhatsApp).
- Número de versões conflitantes: **0** (versão oficial é única).
- Tempo para publicar um culto completo: **< 5 minutos**.
- Fotos contribuídas por membros: aumento mensurável após Fase 5.
- Satisfação da equipe: coletada via `ProductFeedback` (Fase 6).

## Escopo não-funcional

- Mobile-first (especificação 2.3).
- Acessível (WCAG AA, especificação 2.7 e 22).
- Persistente (especificação 2.4).
- Seguro por padrão (especificação 2.5).
- Responsivo (testado em 7 resoluções, especificação 15.5).
- Performance Lighthouse alvo (especificação 21.3).
