

=== PAGE 1 ===
PRAISEHUB — SPEC DRIVEN MASTER V2.0
Central de Mídia ADSA Praise
0. INSTRUÇÃO MESTRA AO AGENTE
Você atuará como uma equipe completa de produto, design, engenharia, segurança e qualidade para
construir uma aplicação chamada:
PraiseHub
Central de Mídia ADSA Praise
A aplicação será a fonte oficial para:
• Divulgação do próximo culto.
• Armazenamento das artes oficiais.
• Download de artes para WhatsApp e redes sociais.
• Download de banners e imagens para telão.
• Consulta de cultos anteriores.
• Criação de álbuns de fotos por culto e por data.
• Envio colaborativo de fotos.
• Administração de eventos, datas, horários, imagens e permissões.
• Registro de quando cada material foi enviado, aprovado e publicado.
Não entregue apenas uma demonstração visual.
Não produza uma interface com botões falsos, dados simulados permanentes, uploads que
desaparecem após atualizar a página ou funções administrativas sem persistência.
A aplicação somente será considerada entregue quando possuir:
1. Interface pública funcional.
2. Área administrativa funcional.
3. Banco de dados persistente.
4. Armazenamento persistente de imagens e arquivos.
5. Controle de usuários e permissões.
6. Upload e download reais.
7. Funcionamento responsivo em celular e computador.
8. Fluxo de publicação e aprovação.
9. Galeria de fotos.
10. Testes dos principais fluxos.
11. Documentação do projeto.
12. Memória persistente das regras e decisões.
13. Histórico de alterações.
14. Código versionado em repositório Git.
1

=== PAGE 2 ===
1. FORMA DE EXECUÇÃO SPEC DRIVEN
Antes de escrever código, execute o projeto segundo esta sequência:
1. Constituição do projeto.
2. Especificação funcional.
3. Identificação de lacunas.
4. Plano técnico.
5. Modelo de dados.
6. Design system.
7. Lista de tarefas.
8. Análise de consistência.
9. Implementação incremental.
10. Testes.
11. Revisão de segurança.
12. Revisão visual e responsiva.
13. Convergência entre código e especificação.
14. Documentação final.
Caso o ambiente tenha suporte ao GitHub Spec Kit, utilizar o fluxo equivalente a:
• constitution
• specify
• clarify
• plan
• tasks
• analyze
• implement
• checklist
• converge
Caso esses comandos não estejam disponíveis, reproduzir o mesmo processo manualmente.
É proibido iniciar a implementação completa antes de registrar:
• O que será construído.
• Por que será construído.
• Quais são as regras obrigatórias.
• Qual será a arquitetura.
• Como a aplicação será testada.
• Como será determinado que a entrega terminou.
2. CONSTITUIÇÃO DO PROJETO
As regras desta seção são permanentes e não podem ser removidas ou flexibilizadas silenciosamente.
2

=== PAGE 3 ===
2.1 Fonte oficial
O PraiseHub será a fonte oficial dos materiais de mídia da ADSA Praise.
O WhatsApp será utilizado para comunicação e compartilhamento de links, mas não será considerado
repositório oficial.
2.2 Administração sem necessidade de código
O administrador deverá conseguir, pela interface:
• Criar um culto.
• Alterar a data.
• Alterar o horário.
• Alterar o nome do evento.
• Informar o pregador.
• Informar o tema.
• Subir a arte de WhatsApp.
• Subir a arte de rede social.
• Subir o banner ou imagem de telão.
• Criar o álbum de fotos.
• Publicar ou retirar um conteúdo.
• Definir qual evento aparecerá como próximo culto.
Nenhuma dessas operações poderá exigir edição manual de código ou alteração direta no GitHub.
2.3 Mobile-first
A aplicação deverá ser projetada primeiramente para celular e depois adaptada para telas maiores.
O fato de uma página abrir no celular não é suficiente para classificá-la como responsiva.
Ela deverá ser confortável para:
• Navegar.
• Ler.
• Fazer upload.
• Selecionar fotos.
• Baixar arquivos.
• Copiar links.
• Preencher formulários.
• Administrar eventos.
2.4 Persistência real
Dados e arquivos não poderão desaparecer após:
• Atualizar a página.
• Fechar o navegador.
3

=== PAGE 4 ===
• Trocar de aparelho.
• Reiniciar a aplicação.
• Publicar uma nova versão do sistema.
2.5 Segurança por padrão
Conteúdos privados deverão permanecer privados.
Permissões deverão ser verificadas no backend e não apenas por ocultação de botões.
2.6 Preservação de conteúdo
Atualizações da aplicação não poderão:
• Apagar eventos existentes.
• Apagar artes existentes.
• Apagar álbuns.
• Perder usuários.
• Sobrescrever configurações sem migração.
• Invalidar links sem justificativa.
2.7 Acessibilidade
A interface deverá possuir:
• Contraste adequado.
• Navegação por teclado.
• Foco visível.
• Textos alternativos.
• Botões identificáveis.
• Mensagens de erro compreensíveis.
• Elementos que não dependam exclusivamente de cores.
2.8 Qualidade verificável
Expressões vagas como “interface bonita”, “boa performance” ou “código limpo” não serão
consideradas critérios suficientes.
Cada requisito deverá possuir uma forma objetiva de validação.
2.9 Sem funções decorativas
Todo botão visível deverá executar uma ação real.
Funções futuras ainda não implementadas deverão ser removidas da interface ou claramente
identificadas como indisponíveis.
4

=== PAGE 5 ===
2.10 Simplicidade para o usuário
A área pública deve ser extremamente simples.
Uma pessoa deverá conseguir encontrar a arte do próximo culto em poucos segundos, mesmo sem
conhecimento técnico.
3. ORGANIZAÇÃO DOS AGENTES
Caso a plataforma permita múltiplos agentes ou subagentes, criar os seguintes papéis.
Caso não permita, o agente principal deverá executar cada papel sequencialmente.
3.1 Agente Orquestrador
Responsável por:
• Coordenar os demais agentes.
• Garantir aderência à especificação.
• Controlar dependências.
• Impedir alterações conflitantes.
• Consolidar os resultados.
• Determinar a ordem de execução.
• Executar a convergência final.
O Orquestrador não deverá aceitar uma entrega somente porque a interface está visualmente pronta.
3.2 Agente de Produto e Especificação
Responsável por:
• Manter os requisitos.
• Validar histórias de usuário.
• Registrar critérios de aceite.
• Identificar lacunas.
• Evitar aumento desnecessário de escopo.
• Garantir que a aplicação resolva a dor original.
3.3 Agente de UX e Design Visual
Responsável por:
• Arquitetura da informação.
• Design system.
• Cores.
• Tipografia.
• Espaçamentos.
5

=== PAGE 6 ===
• Componentes.
• Estados das telas.
• Experiência mobile.
• Experiência desktop.
• Acessibilidade.
• Consistência visual.
Deverá utilizar princípios do UI/UX Pro Max ou regras equivalentes incorporadas nesta especificação.
3.4 Agente Frontend Responsivo
Responsável por:
• Componentes da interface.
• Navegação.
• Formulários.
• Comportamento responsivo.
• Estados de carregamento.
• Estados de erro.
• Feedback de ações.
• Integração com APIs.
• Otimização da experiência no celular.
3.5 Agente Backend e Dados
Responsável por:
• Banco de dados.
• APIs.
• Regras de negócio.
• Autenticação.
• Autorização.
• Auditoria.
• Controle de versões.
• Publicação.
• Arquivamento.
• Integridade dos dados.
3.6 Agente de Mídia e Armazenamento
Responsável por:
• Upload.
• Download.
• Armazenamento.
• Geração de miniaturas.
• Otimização de imagens.
• Pacotes ZIP.
• Controle de formatos.
• Tratamento de falhas.
6

=== PAGE 7 ===
• Remoção de metadados sensíveis.
• Links públicos ou protegidos.
3.7 Agente de Segurança e Privacidade
Responsável por:
• Permissões.
• Proteção de arquivos.
• Validação de uploads.
• Sessões.
• Links temporários.
• Privacidade das fotos.
• Proteção de conteúdos envolvendo crianças.
• Registro de ações administrativas.
• Prevenção de acesso direto não autorizado.
3.8 Agente de Qualidade
Responsável por:
• Testes unitários.
• Testes de integração.
• Testes ponta a ponta.
• Testes de responsividade.
• Testes em navegadores diferentes.
• Testes de acessibilidade.
• Testes de desempenho.
• Registro de evidências.
3.9 Agente Revisor e Convergente
Responsável por comparar:
• Especificação.
• Plano.
• Tarefas.
• Código.
• Banco de dados.
• Interface.
• Testes.
• Documentação.
Qualquer requisito não implementado deverá voltar para a lista de tarefas.
4. MEMÓRIA E RETROALIMENTAÇÃO DO PROJETO
A aplicação e o agente deverão possuir memória de projeto estruturada.
7

=== PAGE 8 ===
Não confiar apenas no histórico da conversa.
4.1 Arquivos obrigatórios
Criar e manter:
• AGENTS.md
• README.md
• CHANGELOG.md
• PROJECT_MEMORY.md
• docs/product.md
• docs/architecture.md
• docs/design-system.md
• docs/permissions.md
• docs/storage.md
• docs/privacy.md
• docs/testing.md
• docs/operations.md
• docs/decisions/
• specs/
• tasks/
4.2 AGENTS.md
O arquivo AGENTS.md deverá informar aos futuros agentes:
• Objetivo do PraiseHub.
• Estrutura do projeto.
• Comandos de instalação.
• Comandos de execução.
• Comandos de teste.
• Padrões de código.
• Regras de segurança.
• Regras de design.
• Arquivos que não podem ser apagados.
• Fluxo de banco de dados.
• Como realizar migrações.
• Como publicar.
• Como validar alterações.
• Como atualizar a documentação.
4.3 Memória de instruções
As regras permanentes deverão ficar em documentos controlados pelo administrador.
Exemplos:
• Mobile-first.
• Não apagar dados.
8

=== PAGE 9 ===
• Não publicar fotos automaticamente.
• Utilizar a paleta definida.
• Exigir aprovação antes da publicação.
• Manter histórico das versões.
4.4 Memória de aprendizado
Registrar separadamente:
• Problemas encontrados.
• Soluções aplicadas.
• Decisões técnicas.
• Preferências aprovadas.
• Erros recorrentes.
• Melhorias sugeridas.
• Resultado de testes.
Aprendizados não poderão modificar automaticamente as regras permanentes.
4.5 Processo de retroalimentação
Antes de cada alteração, o agente deverá:
1. Ler o AGENTS.md .
2. Ler a especificação ativa.
3. Ler as decisões relacionadas.
4. Ler as regras do módulo alterado.
5. Verificar os testes existentes.
Após cada alteração, deverá:
1. Atualizar testes.
2. Executar os testes.
3. Atualizar o CHANGELOG.md .
4. Registrar decisões relevantes.
5. Atualizar a documentação afetada.
6. Verificar se a especificação continua verdadeira.
7. Registrar pendências.
8. Executar a convergência.
4.6 Feedback dos usuários
Criar no banco uma área para:
• Sugestões.
• Erros encontrados.
• Solicitações de melhoria.
• Dificuldades de utilização.
O feedback deverá ficar como pendente até análise do administrador.
9

=== PAGE 10 ===
Somente feedbacks aprovados poderão ser transformados em:
• Nova regra.
• Nova tarefa.
• Alteração de design.
• Mudança funcional.
A aplicação não deverá alterar o próprio comportamento automaticamente com base em qualquer
comentário recebido.
4.7 Proteção dos dados na memória
Não utilizar fotos, dados pessoais ou arquivos enviados pelos usuários para treinamento automático de
modelos.
Não registrar senhas, tokens ou chaves em arquivos de memória.
5. VISÃO DO PRODUTO
O PraiseHub será um portal web responsivo dividido em duas experiências.
5.1 Área pública
Voltada para:
• Membros da mídia.
• Liderança.
• Pessoas responsáveis pela divulgação.
• Membros da igreja.
• Visitantes, quando o conteúdo for público.
Deverá permitir consultar e baixar materiais sem conhecimento técnico.
5.2 Área administrativa
Voltada para:
• Administrador principal.
• Editores.
• Responsáveis por fotografias.
• Aprovadores.
• Colaboradores autorizados.
Deverá permitir a gestão completa dos eventos e materiais.
10

=== PAGE 11 ===
6. PÚBLICOS E PERFIS
6.1 Administrador principal
Pode:
• Administrar toda a aplicação.
• Criar e editar eventos.
• Alterar datas e horários.
• Definir o próximo culto.
• Fazer upload de qualquer material.
• Aprovar e publicar.
• Administrar usuários.
• Alterar configurações.
• Consultar auditoria.
• Restaurar conteúdos.
• Gerar backups.
• Excluir definitivamente.
6.2 Editor de mídia
Pode:
• Criar eventos.
• Editar eventos.
• Fazer upload de artes.
• Criar álbuns.
• Enviar conteúdo para aprovação.
• Editar textos de divulgação.
Não pode:
• Alterar administradores.
• Alterar regras gerais de segurança.
• Excluir definitivamente registros.
• Publicar sem aprovação, quando o fluxo de aprovação estiver ativado.
6.3 Aprovador
Pode:
• Revisar artes.
• Aprovar.
• Reprovar.
• Solicitar ajustes.
• Publicar conteúdos aprovados.
11

=== PAGE 12 ===
6.4 Fotógrafo ou colaborador
Pode:
• Criar rascunhos de álbuns.
• Enviar fotos.
• Informar data e evento.
• Acompanhar o próprio envio.
As fotos deverão entrar em fila de revisão.
6.5 Equipe de mídia
Pode:
• Consultar artes.
• Baixar arquivos.
• Consultar álbuns liberados para a equipe.
• Copiar links.
• Consultar histórico.
6.6 Visitante público
Pode:
• Consultar eventos publicados.
• Baixar artes públicas.
• Visualizar álbuns públicos.
• Utilizar links de compartilhamento.
6.7 Convidado para upload
O administrador poderá gerar um link específico para um evento.
Esse link permitirá que uma pessoa envie fotos sem receber acesso administrativo.
O link deverá possuir:
• Evento vinculado.
• Data de expiração.
• Limite de arquivos.
• Limite de tamanho.
• Possibilidade de revogação.
• Código seguro.
• Aviso de privacidade.
• Campo de identificação do colaborador.
• Aceite das regras de envio.
Todas as fotos enviadas por esse link deverão entrar como:
12

=== PAGE 13 ===
Aguardando revisão
Nenhuma foto colaborativa poderá ser publicada automaticamente.
7. PÁGINA INICIAL PÚBLICA
7.1 Destaque do próximo culto
A parte principal da página deverá exibir:
• Imagem de destaque.
• Nome do culto.
• Data.
• Dia da semana.
• Horário.
• Local.
• Tema.
• Pregador ou responsável, quando informado.
• Botão “Ver materiais”.
• Botão “Baixar artes”.
• Botão “Copiar link”.
• Identificação “Material oficial”.
7.2 Definição automática do próximo culto
Por padrão, o próximo culto será:
• O evento publicado.
• Com data e horário futuros.
• Mais próximo da data atual.
O administrador poderá marcar manualmente um evento como destaque.
A marcação manual terá prioridade sobre o cálculo automático.
7.3 Situação sem próximo culto
Quando não existir evento futuro publicado, mostrar:
Agenda em atualização
Também poderão ser exibidos:
• Último culto.
• Materiais recentes.
• Galeria mais recente.
Não deixar a página quebrada ou vazia.
13

=== PAGE 14 ===
7.4 Conteúdo da semana
Exibir uma seção com:
• Eventos dos próximos sete dias.
• Artes recentemente publicadas.
• Álbuns recentes.
• Comunicados ativos.
7.5 Atalhos principais
Criar botões para:
• Próximo culto.
• Artes oficiais.
• Banner e telão.
• Galeria de fotos.
• Histórico.
8. MÓDULO DE EVENTOS E CULTOS
8.1 Informações do evento
Cada evento deverá possuir:
• Identificador único.
• Nome.
• Categoria.
• Data.
• Horário inicial.
• Horário final opcional.
• Local.
• Endereço opcional.
• Tema.
• Versículo opcional.
• Pregador ou responsável.
• Ministério.
• Descrição.
• Imagem de capa.
• Status.
• Visibilidade.
• Destaque manual.
• Data de publicação.
• Observações internas.
• Criado por.
• Criado em.
• Atualizado por.
• Atualizado em.
14

=== PAGE 15 ===
• Link permanente.
8.2 Categorias iniciais
Criar:
• Culto de Celebração.
• Culto da Família.
• Santa Ceia.
• Escola Bíblica Dominical.
• Quarta Profética.
• Campanha.
• Evento de Louvor.
• ADSA Praise.
• ADSA Kids.
• CIADSA.
• JUADSA.
• Mulheres.
• Jovens.
• Crianças.
• Conferência.
• Festividade.
• Ensaio.
• Comunicado.
• Institucional.
• Outro.
O administrador poderá criar e editar categorias.
8.3 Status
Utilizar:
• Rascunho.
• Em produção.
• Aguardando aprovação.
• Ajustes solicitados.
• Aprovado.
• Programado.
• Publicado.
• Encerrado.
• Arquivado.
• Cancelado.
8.4 Duplicação de eventos
Permitir duplicar um evento anterior.
15

=== PAGE 16 ===
Ao duplicar:
• Copiar estrutura.
• Copiar categoria.
• Copiar horários, se solicitado.
• Não copiar automaticamente fotos.
• Não publicar automaticamente.
• Não reutilizar artes antigas como versão oficial.
• Permitir utilizar artes anteriores como referência.
8.5 Eventos recorrentes
Permitir recorrência:
• Semanal.
• Quinzenal.
• Mensal.
• Datas personalizadas.
Cada ocorrência deverá se transformar em um evento independente para permitir artes e fotos
próprias.
9. CENTRAL DE ARTES
9.1 Materiais obrigatórios principais
A aplicação deverá trabalhar, no mínimo, com:
WhatsApp e Stories
Formato sugerido:
• Vertical.
• 1080 × 1920.
• PNG ou JPG.
Rede social
Formatos sugeridos:
• Quadrado 1080 × 1080.
• Vertical 1080 × 1350.
• PNG ou JPG.
Banner e telão
Formato sugerido:
• Proporção 16:9.
16

=== PAGE 17 ===
• 1920 × 1080.
• PNG ou JPG.
Outros
• PDF.
• Convite.
• Capa.
• Miniatura.
• Reels ou vídeo.
• ZIP.
• Material para impressão.
As dimensões são sugestões e não deverão impedir o upload de materiais legítimos diferentes.
9.2 Card de materiais do culto
Na tela de cada evento, mostrar cards separados:
• WhatsApp.
• Redes sociais.
• Banner/Telão.
• Outros arquivos.
• Galeria de fotos.
Cada card deverá informar:
• Disponível.
• Pendente.
• Em aprovação.
• Publicado.
• Atualizado.
9.3 Informações da arte
Cada arte deverá possuir:
• Nome.
• Evento.
• Tipo.
• Formato.
• Dimensões.
• Tamanho.
• Extensão.
• Versão.
• Status.
• Visibilidade.
• Data de envio.
• Enviado por.
• Data de aprovação.
• Aprovado por.
17

=== PAGE 18 ===
• Observações.
• Texto de divulgação.
• Contagem de downloads.
• Link permanente.
9.4 Upload
Permitir:
• Seleção de arquivo.
• Arrastar e soltar.
• Upload de vários arquivos.
• Upload pelo celular.
• Captura a partir da biblioteca de fotos do celular.
• Visualização do progresso.
• Cancelamento.
• Nova tentativa após falha.
• Retomada de upload quando tecnicamente suportada.
9.5 Formatos aceitos
Aceitar, conforme configuração:
• JPG.
• JPEG.
• PNG.
• WEBP.
• GIF.
• PDF.
• MP4.
• ZIP.
• HEIC.
• HEIF.
Quando HEIC ou HEIF não forem suportados diretamente, converter para formato compatível ou
apresentar orientação clara.
9.6 Versões
Não substituir silenciosamente uma arte.
Criar:
• Versão 1.
• Versão 2.
• Versão 3.
Somente uma versão poderá estar marcada como:
Versão oficial atual
18

=== PAGE 19 ===
As versões anteriores deverão ficar no histórico administrativo.
9.7 Aprovação
Fluxo:
1. Rascunho.
2. Enviado para aprovação.
3. Ajustes solicitados.
4. Nova versão enviada.
5. Aprovado.
6. Publicado.
7. Arquivado.
Registrar comentários e responsáveis.
9.8 Download
Permitir:
• Download individual.
• Download de itens selecionados.
• Download de todas as artes do culto.
• Download somente de redes sociais.
• Download somente do telão.
• Download de pacote completo em ZIP.
9.9 Nome dos arquivos
Padronizar os nomes baixados.
Exemplo:
2026-08-02_Culto-da-Familia_Status-WhatsApp_v2.png
Não utilizar nomes inseguros ou caracteres incompatíveis.
9.10 Compartilhamento
Permitir:
• Copiar link do evento.
• Copiar link da arte.
• Compartilhar pelo menu do celular.
• Gerar mensagem pronta para WhatsApp.
Mensagem padrão:
“As artes oficiais do próximo culto já estão disponíveis no PraiseHub. Acesse o link para visualizar e
baixar as versões atualizadas.”
19

=== PAGE 20 ===
Adicionar o link automaticamente.
10. GALERIA DE FOTOS
10.1 Separação das artes
Fotos de cultos não deverão ficar misturadas com artes de divulgação.
Criar um módulo independente chamado:
Galeria de Fotos
10.2 Organização dos álbuns
Cada álbum deverá possuir:
• Nome.
• Evento relacionado.
• Data.
• Descrição.
• Fotógrafo ou colaborador.
• Imagem de capa.
• Quantidade de fotos.
• Status.
• Visibilidade.
• Permissão de download.
• Data de criação.
• Data de publicação.
• Link permanente.
10.3 Criação automática
Ao criar um evento, o administrador poderá marcar:
Preparar álbum de fotos para este culto
O sistema criará um álbum em rascunho vinculado ao evento.
10.4 Upload em massa
Permitir:
• Várias fotos simultaneamente.
• Arrastar e soltar.
• Seleção pela galeria do celular.
• Visualização de miniaturas.
• Progresso por foto.
20

=== PAGE 21 ===
• Reordenação.
• Definição da capa.
• Exclusão antes da publicação.
• Nova tentativa em caso de falha.
10.5 Contribuição de fotos
O administrador poderá ativar:
Receber fotos deste culto
Ao ativar:
1. Gerar link de contribuição.
2. Definir validade.
3. Definir quantidade máxima.
4. Definir tamanho máximo.
5. Compartilhar o link.
6. Receber fotos em fila de moderação.
7. Aprovar ou rejeitar cada foto.
8. Adicionar aprovadas ao álbum.
10.6 Visibilidade
Cada álbum poderá ser:
• Público.
• Somente equipe de mídia.
• Somente usuários autenticados.
• Acesso por link.
• Privado.
10.7 Download
Permitir:
• Download individual.
• Seleção de várias fotos.
• Download do álbum completo.
• Geração de ZIP.
• Desativação do download pelo administrador.
10.8 Privacidade das fotos
Implementar:
• Remoção de localização GPS dos arquivos publicados.
• Remoção de metadados desnecessários.
• Opção de ocultar foto sem apagar.
• Solicitação de remoção.
21

=== PAGE 22 ===
• Registro de quem publicou.
• Moderação obrigatória para contribuições.
• Cuidado especial com fotos de crianças.
• Proibição de reconhecimento facial.
• Proibição de identificação automática de pessoas.
10.9 Autorização
O formulário de contribuição deverá informar:
• Para qual finalidade as fotos poderão ser utilizadas.
• Que o envio não garante publicação.
• Que o administrador poderá rejeitar ou retirar o conteúdo.
• Como solicitar remoção.
• Que o colaborador deve possuir autorização para enviar o conteúdo.
Quando houver fotos de crianças, a publicação deverá exigir revisão administrativa reforçada e respeito
à autorização dos responsáveis.
11. HISTÓRICO
Criar uma área para eventos anteriores.
11.1 Filtros
Permitir filtrar por:
• Nome.
• Data.
• Período.
• Ano.
• Mês.
• Categoria.
• Ministério.
• Tipo de material.
• Status.
• Pregador.
• Arte.
• Álbum.
• Conteúdo público ou restrito.
11.2 Arquivamento
Após a data do culto, o sistema poderá sugerir o arquivamento.
Arquivar não significa excluir.
22

=== PAGE 23 ===
O evento arquivado deverá:
• Continuar pesquisável.
• Manter os arquivos.
• Manter os links.
• Manter o histórico.
• Sair da página principal.
12. BUSCA
Criar busca geral capaz de localizar:
• Cultos.
• Eventos.
• Artes.
• Álbuns.
• Datas.
• Categorias.
• Ministérios.
• Pregadores.
• Tipos de material.
• Temas.
Apresentar resultados agrupados.
Ordenações:
• Mais recentes.
• Próximos eventos.
• Mais antigos.
• Mais baixados.
• Ordem alfabética.
13. ÁREA ADMINISTRATIVA
13.1 Dashboard
Mostrar:
• Próximo culto.
• Eventos da semana.
• Artes pendentes.
• Eventos sem arte.
• Eventos sem banner.
• Álbuns aguardando fotos.
• Fotos aguardando aprovação.
23

=== PAGE 24 ===
• Últimos uploads.
• Armazenamento utilizado.
• Atividades recentes.
13.2 Ações rápidas
Criar:
• Novo culto.
• Enviar arte.
• Criar álbum.
• Receber fotos.
• Aprovar materiais.
• Convidar usuário.
• Consultar histórico.
13.3 Assistente de criação do culto
Criar um processo em etapas:
Etapa 1 — Informações
• Nome.
• Categoria.
• Data.
• Horário.
• Local.
• Tema.
• Pregador.
Etapa 2 — Materiais
• WhatsApp.
• Rede social.
• Banner/Telão.
• Outros arquivos.
Etapa 3 — Galeria
• Criar álbum.
• Permitir contribuição.
• Definir visibilidade.
Etapa 4 — Revisão
• Conferir informações.
• Salvar rascunho.
• Enviar para aprovação.
• Publicar.
O usuário poderá salvar e continuar depois.
24

=== PAGE 25 ===
13.4 Indicador de completude
Exemplo:
• Informações do culto: concluídas.
• Arte de WhatsApp: disponível.
• Rede social: disponível.
• Banner/Telão: pendente.
• Álbum: preparado.
• Publicação: aguardando.
13.5 Alterações posteriores
O administrador poderá alterar:
• Data.
• Horário.
• Imagem.
• Texto.
• Pregador.
• Visibilidade.
• Status.
Toda alteração relevante deverá ficar registrada.
14. DESIGN SYSTEM
14.1 Direção visual
A interface deverá ser:
• Moderna.
• Organizada.
• Acolhedora.
• Ministerial.
• Elegante.
• Clara.
• Visualmente leve.
• Fácil para pessoas com pouca familiaridade digital.
Evitar:
• Excesso de efeitos.
• Poluição visual.
• Gradientes exagerados.
• Elementos piscando.
• Carrosséis automáticos.
• Ícones sem significado.
25

=== PAGE 26 ===
• Aparência de sistema empresarial antigo.
• Aparência infantil fora dos módulos infantis.
14.2 Identidade inicial
Enquanto o logo oficial não for enviado:
• Azul profundo como cor principal.
• Branco como base.
• Dourado suave como destaque.
• Cinzas neutros para estrutura.
O administrador deverá conseguir enviar:
• Logo.
• Ícone.
• Imagem de capa.
• Cores oficiais.
14.3 Tokens
Criar tokens em três níveis:
Primitivos
Valores brutos de:
• Cores.
• Espaçamento.
• Tipografia.
• Bordas.
• Sombras.
• Raios.
Semânticos
Exemplos:
• primary
• secondary
• background
• surface
• text
• muted
• success
• warning
• danger
26

=== PAGE 27 ===
Componentes
Exemplos:
• button-primary-background
• card-border
• input-focus
• navigation-active
Não espalhar valores de cor aleatórios diretamente nos componentes.
14.4 Tipografia
• Texto-base mínimo de 16 px.
• Altura de linha confortável.
• Títulos com hierarquia clara.
• Não utilizar textos minúsculos para informações importantes.
• Priorizar fontes legíveis.
• Evitar múltiplas famílias tipográficas sem necessidade.
14.5 Botões e áreas de toque
• Área de toque mínima recomendada de 48 × 48 px.
• Espaçamento adequado entre ações.
• Não depender de hover.
• Exibir feedback ao tocar.
• Mostrar estado de carregamento.
• Impedir cliques duplicados durante processamento.
14.6 Ícones
• Utilizar ícones vetoriais consistentes.
• Não utilizar emoji como substituto padrão de ícone.
• Ícones isolados deverão possuir rótulo acessível.
• Ações críticas deverão combinar ícone e texto.
14.7 Estados dos componentes
Especificar:
• Normal.
• Hover.
• Foco.
• Pressionado.
• Carregando.
• Desativado.
• Erro.
• Sucesso.
27

=== PAGE 28 ===
15. COMPORTAMENTO RESPONSIVO
15.1 Mobile
Em celular:
• Layout de uma coluna.
• Navegação inferior com até cinco itens ou menu simples.
• Botões principais em largura confortável.
• Formulários empilhados.
• Cards ocupando a largura disponível.
• Upload utilizável com o dedo.
• Ações frequentes próximas da parte inferior.
• Imagens sem cortes indevidos.
• Modais quase em tela cheia quando necessário.
• Respeitar áreas seguras do aparelho.
• Não existir rolagem horizontal.
15.2 Tablet
Em tablet:
• Uma ou duas colunas conforme o conteúdo.
• Formulários com melhor aproveitamento de espaço.
• Navegação lateral ou superior.
• Galeria com duas ou três colunas.
15.3 Desktop
Em computador:
• Área administrativa com menu lateral.
• Conteúdo central com largura controlada.
• Galeria com três ou quatro colunas.
• Formulários divididos em seções.
• Painéis e filtros lado a lado.
• Ações administrativas visíveis sem excesso.
15.4 Grades sugeridas
Mobile
• 1 coluna.
Tablet pequeno
• 2 colunas.
28

=== PAGE 29 ===
Tablet grande
• 2 ou 3 colunas.
Desktop
• 3 ou 4 colunas.
A quantidade deverá se adaptar ao espaço disponível, e não somente a dispositivos específicos.
15.5 Tamanhos mínimos de teste
Testar, no mínimo:
• 360 × 800.
• 390 × 844.
• 412 × 915.
• 768 × 1024.
• 1024 × 768.
• 1366 × 768.
• 1440 × 900.
15.6 Regras obrigatórias
• Utilizar viewport correto.
• Evitar larguras fixas rígidas.
• Utilizar Grid e Flexbox.
• Utilizar imagens fluidas.
• Reservar espaço antes de carregar imagens.
• Não cortar textos.
• Não esconder ações importantes.
• Não desativar zoom do navegador.
• Não depender de orientação horizontal.
16. EXPERIÊNCIA DE UPLOAD
16.1 Interface
A área de upload deverá exibir:
• Arquivos selecionados.
• Miniaturas.
• Nome.
• Tamanho.
• Progresso.
• Status.
• Mensagem de erro.
• Botão para tentar novamente.
• Botão para remover.
29

=== PAGE 30 ===
• Resumo final.
16.2 Conexão instável
Quando tecnicamente possível:
• Retomar upload interrompido.
• Manter arquivos já concluídos.
• Não reiniciar todo o lote.
• Informar qual arquivo falhou.
16.3 Validações
Validar:
• Tipo real do arquivo.
• Extensão.
• Tamanho.
• Dimensões quando aplicável.
• Quantidade.
• Nome seguro.
• Arquivo corrompido.
• Conteúdo incompatível.
16.4 Processamento
Para imagens públicas:
• Gerar miniaturas.
• Gerar versão otimizada.
• Preservar original quando necessário.
• Remover metadados de localização.
• Utilizar carregamento tardio na galeria.
• Não carregar arquivos originais pesados na grade.
17. ARQUITETURA TÉCNICA
17.1 Stack preferencial
Quando suportado pelo ambiente, utilizar:
• Next.js ou framework React equivalente.
• TypeScript em modo estrito.
• Tailwind CSS.
• shadcn/ui ou componentes acessíveis equivalentes.
• Banco PostgreSQL.
• Autenticação integrada.
• Armazenamento de objetos.
30

=== PAGE 31 ===
• Políticas de acesso por usuário e perfil.
• Testes com Playwright.
• Testes de acessibilidade automatizados.
• Pipeline de qualidade no GitHub.
17.2 Alternativa nativa da plataforma
Caso a Z.AI ofereça banco, autenticação e armazenamento nativos, eles poderão ser utilizados.
Entretanto, deverão preservar:
• Persistência.
• Controle de acesso.
• Exportação.
• Banco relacional ou modelo consistente.
• Upload real.
• Links protegidos.
• Auditoria.
• Possibilidade de migração.
17.3 Fallback recomendado
Quando a plataforma não possuir backend completo, utilizar:
• Supabase Auth.
• Supabase PostgreSQL.
• Supabase Storage.
• Row Level Security.
• URLs assinadas para arquivos privados.
17.4 GitHub
Utilizar o GitHub para:
• Código-fonte.
• Especificação.
• Tarefas.
• Documentação.
• Histórico de alterações.
• Issues.
• Pipeline de testes.
• Versionamento.
Não utilizar o repositório Git como armazenamento principal das fotos e artes enviadas pelos usuários.
18. MODELO DE DADOS
Criar, no mínimo:
31

=== PAGE 32 ===
18.1 profiles
• id
• nome
• email
• avatar
• perfil
• status
• criado_em
• ultimo_acesso
18.2 church_settings
• id
• nome_da_igreja
• nome_da_aplicacao
• subtitulo
• logo
• icone
• imagem_de_capa
• cores
• endereco
• fuso_horario
• configuracoes_de_acesso
Utilizar o fuso:
America/Sao_Paulo
18.3 event_categories
• id
• nome
• icone
• ativo
• ordem
18.4 events
• id
• nome
• categoria_id
• descricao
• data
• horario_inicio
• horario_fim
• local
• endereco
• tema
• versiculo
32

=== PAGE 33 ===
• pregador
• ministerio
• capa
• status
• visibilidade
• destaque_manual
• publicado_em
• criado_por
• criado_em
• atualizado_por
• atualizado_em
18.5 media_assets
• id
• evento_id
• nome
• tipo
• status
• visibilidade
• versao_atual
• texto_de_divulgacao
• observacoes
• enviado_por
• aprovado_por
• aprovado_em
• publicado_em
• quantidade_downloads
• criado_em
• atualizado_em
18.6 media_versions
• id
• media_asset_id
• numero_da_versao
• caminho_do_arquivo
• nome_original
• nome_padronizado
• extensao
• mime_type
• tamanho
• largura
• altura
• checksum
• arquivo_oficial
• enviado_por
• enviado_em
33

=== PAGE 34 ===
18.7 albums
• id
• evento_id
• nome
• descricao
• fotografo
• capa
• status
• visibilidade
• permitir_download
• aceitar_contribuicoes
• criado_por
• criado_em
• publicado_em
18.8 album_photos
• id
• album_id
• caminho_original
• caminho_otimizado
• caminho_thumbnail
• nome_original
• legenda
• ordem
• status
• visibilidade
• enviado_por
• enviado_em
• aprovado_por
• aprovado_em
18.9 contribution_links
• id
• evento_id
• album_id
• token_seguro
• ativo
• expira_em
• limite_de_arquivos
• limite_de_tamanho
• criado_por
• criado_em
• revogado_em
18.10 contribution_submissions
• id
34

=== PAGE 35 ===
• contribution_link_id
• nome_do_colaborador
• contato_opcional
• arquivo
• aceite_de_uso
• status
• enviado_em
• revisado_por
• revisado_em
• motivo_da_rejeicao
18.11 approvals
• id
• tipo_de_conteudo
• conteudo_id
• versao
• decisao
• comentario
• usuario_id
• criado_em
18.12 audit_logs
• id
• usuario_id
• acao
• entidade
• entidade_id
• descricao
• dados_anteriores
• dados_posteriores
• ip_quando_permitido
• criado_em
18.13 downloads
• id
• conteudo_id
• tipo_de_conteudo
• usuario_id_opcional
• criado_em
Não registrar informações invasivas sem necessidade.
18.14 product_feedback
• id
• usuario_id_opcional
• categoria
35

=== PAGE 36 ===
• descricao
• status
• decisao_do_administrador
• criado_em
• analisado_em
19. ARMAZENAMENTO
19.1 Buckets ou áreas
Separar:
Conteúdo público
• Artes publicadas.
• Capas públicas.
• Miniaturas públicas.
Conteúdo privado
• Artes em rascunho.
• Versões anteriores.
• Fotos privadas.
• Envios aguardando aprovação.
• Originais protegidos.
19.2 Convenção de caminhos
Utilizar estrutura semelhante a:
igreja/evento/tipo/identificador-versao.extensao
Exemplo:
adsa-praise/evt-2026-08-02/whatsapp/status-v2.png
19.3 Links privados
Arquivos privados deverão utilizar:
• Autorização do usuário; ou
• URL assinada e temporária.
Não utilizar URLs públicas permanentes para arquivos privados.
36

=== PAGE 37 ===
19.4 Exclusão
A exclusão deverá ocorrer em duas fases:
1. Lixeira ou exclusão lógica.
2. Exclusão definitiva confirmada.
Ao excluir definitivamente:
• Excluir o registro.
• Excluir o arquivo físico.
• Registrar auditoria.
20. SEGURANÇA
Implementar:
• Senhas protegidas.
• Sessões seguras.
• Recuperação de senha.
• Controle por perfil.
• Políticas no banco.
• Políticas no armazenamento.
• Validação de uploads.
• Limitação de tentativas.
• Proteção contra envio automatizado abusivo.
• Proteção contra acesso direto.
• Confirmação para ações destrutivas.
• Segredos em variáveis de ambiente.
• Nenhuma chave no código.
• Nenhuma chave no GitHub.
• Nenhum token exibido no frontend.
O último administrador ativo não poderá ser removido sem que outro seja definido.
21. DESEMPENHO
21.1 Imagens
• Utilizar imagens responsivas.
• Gerar tamanhos adequados ao dispositivo.
• Utilizar formatos modernos quando possível.
• Carregar miniaturas na galeria.
• Carregar originais somente ao abrir ou baixar.
• Utilizar lazy loading.
• Reservar proporção para evitar mudança de layout.
37

=== PAGE 38 ===
21.2 Página inicial
Priorizar o carregamento de:
1. Cabeçalho.
2. Informações do próximo culto.
3. Imagem principal otimizada.
4. Botões de download.
5. Conteúdo secundário.
21.3 Metas
Buscar, em ambiente de produção:
• Acessibilidade Lighthouse igual ou superior a 95.
• Boas práticas igual ou superior a 90.
• SEO igual ou superior a 90 nas páginas públicas.
• Performance mobile igual ou superior a 85, quando tecnicamente viável.
Não sacrificar segurança ou funcionalidade apenas para melhorar pontuação.
22. ACESSIBILIDADE
Validar:
• Contraste mínimo adequado.
• Alt text.
• Rótulos dos formulários.
• Navegação por teclado.
• Foco visível.
• Ordem de foco.
• Leitor de tela.
• Mensagens de erro associadas aos campos.
• Botões com nomes acessíveis.
• Diálogos com foco controlado.
• Fechamento por teclado.
• Preferência de movimento reduzido.
• Não depender somente de cor.
23. TESTES
23.1 Testes unitários
Testar:
• Cálculo do próximo culto.
38

=== PAGE 39 ===
• Prioridade do destaque manual.
• Regras de status.
• Padronização de nomes.
• Permissões.
• Validação de arquivos.
• Expiração dos links.
• Mudança de versão oficial.
23.2 Testes de integração
Testar:
• Banco de dados.
• Autenticação.
• Upload.
• Armazenamento.
• Políticas de acesso.
• Publicação.
• Download.
• Auditoria.
• Exclusão.
• Restauração.
23.3 Testes ponta a ponta
Criar cenários automatizados:
Cenário 1 — Criar e publicar culto
1. Administrador entra.
2. Cria evento.
3. Informa data e horário.
4. Envia arte de WhatsApp.
5. Envia banner.
6. Publica.
7. Evento aparece como próximo culto.
8. Visitante baixa os materiais.
Cenário 2 — Corrigir arte
1. Versão 1 está publicada.
2. Administrador envia versão 2.
3. Versão 2 é aprovada.
4. Versão 2 se torna oficial.
5. Versão 1 permanece no histórico.
Cenário 3 — Galeria
1. Administrador cria álbum.
2. Envia várias fotos.
3. Escolhe capa.
39

=== PAGE 40 ===
4. Publica.
5. Visitante visualiza.
6. Download funciona conforme permissão.
Cenário 4 — Contribuição
1. Administrador gera link.
2. Colaborador acessa no celular.
3. Envia fotos.
4. Fotos entram como pendentes.
5. Administrador aprova.
6. Somente aprovadas aparecem no álbum.
Cenário 5 — Segurança
1. Usuário não autenticado tenta acessar arquivo privado.
2. Acesso é negado.
3. Link expirado não funciona.
4. Editor não consegue alterar administradores.
23.4 Navegadores
Testar:
• Chromium.
• Firefox.
• WebKit/Safari.
23.5 Mobile
Executar os principais cenários em emulação de:
• Android.
• iPhone.
• Tablet.
23.6 Teste visual
Gerar capturas de referência das páginas principais.
Detectar:
• Componentes desalinhados.
• Textos cortados.
• Rolagem horizontal.
• Sobreposição.
• Modais fora da tela.
• Botões inacessíveis.
• Imagens deformadas.
40

=== PAGE 41 ===
24. ESTRUTURA DO REPOSITÓRIO
Criar estrutura equivalente a:
/
├── AGENTS.md
├── README.md
├── CHANGELOG.md
├── PROJECT_MEMORY.md
├── package.json
├── .env.example
├── .github/
│ └── workflows/
├── .specify/
│ └── memory/
│ └── constitution.md
├── specs/
│ └── 001-praisehub/
│ ├── spec.md
│ ├── plan.md
│ ├── tasks.md
│ └── checklists/
├── docs/
│ ├── product.md
│ ├── architecture.md
│ ├── design-system.md
│ ├── permissions.md
│ ├── storage.md
│ ├── privacy.md
│ ├── testing.md
│ ├── operations.md
│ └── decisions/
├── src/
│ ├── app/
│ ├── components/
│ ├── features/
│ ├── lib/
│ ├── services/
│ ├── styles/
│ └── types/
├── public/
├── database/
│ ├── migrations/
│ ├── policies/
│ └── seed/
└── tests/
├── unit/
├── integration/
41

=== PAGE 42 ===
├── e2e/
└── accessibility/
Adaptar a estrutura quando o ambiente exigir, preservando a separação das responsabilidades.
25. FASES DE IMPLEMENTAÇÃO
Fase 1 — Fundação
• Repositório.
• Constituição.
• Documentação.
• Banco.
• Autenticação.
• Perfis.
• Configurações.
• Design system.
Fase 2 — Eventos
• Cadastro.
• Edição.
• Destaque.
• Próximo culto.
• Área pública.
• Histórico básico.
Fase 3 — Artes
• Upload.
• Tipos.
• Versões.
• Aprovação.
• Publicação.
• Download.
• ZIP.
Fase 4 — Galeria
• Álbuns.
• Upload em massa.
• Miniaturas.
• Capa.
• Visibilidade.
• Download.
42

=== PAGE 43 ===
Fase 5 — Colaboração
• Link de contribuição.
• Expiração.
• Fila de moderação.
• Aprovação de fotos.
• Privacidade.
Fase 6 — Administração avançada
• Dashboard.
• Auditoria.
• Backup.
• Feedback.
• Notificações.
• Indicadores.
Fase 7 — Qualidade
• Testes completos.
• Responsividade.
• Acessibilidade.
• Desempenho.
• Segurança.
• Convergência.
Cada fase deverá terminar com uma aplicação utilizável.
26. CRITÉRIOS DE CONCLUSÃO
O projeto não estará concluído enquanto qualquer condição abaixo estiver pendente:
1. O administrador consegue entrar.
2. O administrador consegue criar um culto.
3. O administrador consegue alterar data e horário.
4. O administrador consegue enviar arte de WhatsApp.
5. O administrador consegue enviar arte de rede social.
6. O administrador consegue enviar banner ou imagem de telão.
7. Os arquivos continuam disponíveis após novo acesso.
8. O administrador consegue publicar.
9. O próximo culto aparece na página inicial.
10. O visitante consegue baixar os arquivos públicos.
11. O administrador consegue criar álbum.
12. Várias fotos podem ser enviadas.
13. Um colaborador consegue enviar fotos por link.
14. As contribuições entram em moderação.
15. Arquivos privados não ficam públicos.
16. O histórico registra as ações.
17. A aplicação funciona em celular.
43

=== PAGE 44 ===
18. A aplicação funciona em computador.
19. Não existe rolagem horizontal indevida.
20. Não existem botões sem função.
21. Não existem dados simulados obrigatórios.
22. Os testes principais passam.
23. O repositório possui documentação.
24. A memória do projeto está atualizada.
25. A especificação corresponde ao que foi implementado.
27. RELATÓRIO FINAL OBRIGATÓRIO
Ao concluir, apresentar:
• Link da aplicação.
• Link do repositório.
• Tecnologias utilizadas.
• Estrutura do banco.
• Estrutura do armazenamento.
• Usuário administrador inicial.
• Orientação para alterar a senha.
• Orientação para criar o primeiro culto.
• Orientação para subir artes.
• Orientação para criar álbum.
• Orientação para gerar link de contribuição.
• Perfis e permissões.
• Testes executados.
• Resultado dos testes.
• Limitações conhecidas.
• Funcionalidades pendentes.
• Procedimento de backup.
• Procedimento de atualização.
• Procedimento de recuperação.
Não ocultar limitações.
28. DADOS INICIAIS DA APLICAÇÃO
Nome
PraiseHub
Subtítulo
Central de Mídia ADSA Praise
44

=== PAGE 45 ===
Texto principal
Artes, fotos e materiais oficiais da ADSA Praise, organizados em um só lugar.
Texto complementar
Consulte o próximo culto, encontre as versões atualizadas e baixe os materiais necessários para
divulgação e utilização na igreja.
Informação institucional
O PraiseHub é a fonte oficial dos materiais de mídia da ADSA Praise.
Botões principais
• Ver próximo culto.
• Baixar artes.
• Abrir galeria.
• Consultar histórico.
29. COMANDO DE INÍCIO DA EXECUÇÃO
Leia integralmente esta especificação.
Antes de implementar:
1. Crie a constituição do projeto.
2. Crie o AGENTS.md .
3. Crie o modelo de dados.
4. Crie o plano técnico.
5. Crie o design system.
6. Crie as histórias de usuário.
7. Crie os critérios de aceite.
8. Crie a lista de tarefas em ordem de dependência.
9. Identifique qualquer limitação real do ambiente.
10. Escolha os serviços nativos ou equivalentes necessários.
Depois, implemente a Fase 1 e a Fase 2.
Não interrompa o trabalho apenas após criar o layout.
Ao final de cada fase:
• Execute os testes.
• Corrija as falhas.
• Atualize a documentação.
• Atualize a memória.
45

=== PAGE 46 ===
• Compare a implementação com a especificação.
• Registre as pendências.
• Continue para a próxima fase.
O resultado final deve ser uma aplicação funcional, persistente, segura, responsiva e utilizável pela
equipe de mídia da ADSA Praise.
46