# MISSÃO: IMPLEMENTAR COMPLETAMENTE O TRAVEL MANAGER

Você será o engenheiro de software responsável pela implementação completa do projeto Travel Manager.

Seu objetivo é transformar a documentação existente em uma aplicação funcional, testada, documentada e publicada no GitHub.

**Não se limite a analisar, planejar ou criar arquivos iniciais. Execute efetivamente o desenvolvimento até concluir o projeto.**

## 1. LEITURA OBRIGATÓRIA

Antes de iniciar qualquer implementação:

1. Leia integralmente o arquivo `RULES.md`.
2. Leia integralmente o arquivo `README.md`, caso exista.
3. Leia a especificação funcional do Travel Manager.
4. Analise todos os arquivos Markdown existentes.
5. Inspecione a estrutura atual do repositório.
6. Verifique o estado atual do Git.
7. Identifique funcionalidades já implementadas.
8. Identifique funcionalidades pendentes.

Não recrie funcionalidades que já estejam implementadas corretamente.

As regras do `RULES.md` são obrigatórias durante todo o desenvolvimento.

## 2. OBJETIVO FINAL

Entregar uma aplicação completa com:

### Frontend
- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- shadcn/ui.
- PWA.
- Interface responsiva e mobile-first.

### Backend
- Python.
- FastAPI.
- SQLAlchemy.
- JWT.
- API REST documentada.

### Banco de dados
- PostgreSQL.
- Migrations com Alembic.
- Relacionamentos e integridade referencial.

### Infraestrutura
- Docker.
- Docker Compose.
- Volumes persistentes.
- Configurações por variáveis de ambiente.

## 3. DESENVOLVIMENTO AUTÔNOMO

Divida o projeto em módulos e implemente todos eles.

Não interrompa o desenvolvimento apenas porque concluiu um módulo.

Após finalizar cada módulo:

1. Execute os testes.
2. Corrija os problemas encontrados.
3. Verifique a integração com os módulos existentes.
4. Atualize a documentação.
5. Faça commit e push para o GitHub.
6. Continue para o próximo módulo.

Não solicite aprovação a cada funcionalidade.

Quando encontrar decisões técnicas pendentes, adote a solução mais segura e coerente com a especificação, documentando a decisão.

Se encontrar um bloqueio real, registre exatamente o problema e continue com as demais atividades independentes.

## 4. ORDEM DE IMPLEMENTAÇÃO

Siga esta sequência:

### Fase 1 — Fundação
- Estrutura do projeto.
- Docker Compose.
- PostgreSQL.
- Backend FastAPI.
- Frontend React.
- Configurações de ambiente.
- Testes iniciais.
- Documentação de instalação.

### Fase 2 — Autenticação e família
- Cadastro.
- Login.
- JWT.
- Recuperação de senha.
- Grupo familiar.
- Convites.
- Participantes.
- Controle de acesso.

### Fase 3 — Viagens e destinos
- Cadastro de viagens.
- Categorias.
- Status.
- Destinos múltiplos.
- Catálogo permanente de destinos.
- Catálogo de atrações e restaurantes.
- Favoritos e avaliações.

### Fase 4 — Roteiros
- Atividades.
- Programação diária.
- Calendário.
- Organização dos passeios.
- Mapas e rotas.

### Fase 5 — Reservas
- Hospedagens.
- Voos.
- Transportes.
- Restaurantes.
- Ingressos.
- Seguro-viagem.

### Fase 6 — Documentos
- Upload.
- Download.
- Organização.
- Documentos pessoais.
- Documentos das viagens.
- Visualização.
- Proteção de acesso.

### Fase 7 — Financeiro
- Orçamento.
- Despesas.
- Categorias.
- Participantes.
- Pagamentos.
- Integração com reservas.
- Relatórios financeiros.

### Fase 8 — Organização da viagem
- Checklists.
- Tarefas.
- Bagagem.
- Contatos de emergência.
- Notificações.

### Fase 9 — Inteligência artificial
- Assistente de viagens.
- Pesquisa de destinos.
- Geração de roteiros.
- Interpretação de documentos.
- Busca inteligente.
- Análise financeira.

### Fase 10 — Integrações
- Google Maps.
- Google Fotos.
- Google Agenda.
- OpenAI.
- Pesquisa externa.
- Previsão meteorológica.
- E-mail.
- Push notifications.

### Fase 11 — PWA e offline
- Instalação.
- Cache.
- Banco local.
- Fila de operações.
- Sincronização.
- Resolução de conflitos.

### Fase 12 — Relatórios e administração
- Dashboard.
- Indicadores.
- Relatórios PDF.
- Exportação Excel.
- Importação JSON e CSV.
- Auditoria.
- Backup e restauração.

### Fase 13 — Finalização
- Testes completos.
- Correções.
- Testes de segurança.
- Testes de integração.
- Testes de responsividade.
- Testes offline.
- Verificação dos containers.
- Revisão da documentação.
- Preparação para implantação na VPS.

## 5. QUALIDADE OBRIGATÓRIA

Não considere uma funcionalidade concluída apenas porque a tela foi criada.

Cada módulo deverá possuir:

- Interface funcional.
- Backend funcional.
- Persistência no PostgreSQL.
- Validação dos dados.
- Tratamento de erros.
- Controle de acesso.
- Testes automatizados.
- Documentação pertinente.

Não utilizar dados simulados como substitutos de funcionalidades reais.

Não deixar botões sem funcionamento.

Não criar integrações fictícias.

Quando uma integração depender de credenciais externas, implementar a estrutura real, documentar as variáveis necessárias e disponibilizar configuração para ativação.

## 6. INTERFACE

Priorize experiência mobile-first.

O sistema deverá apresentar:

- Dashboard moderno.
- Navegação intuitiva.
- Tema claro e escuro.
- Formulários funcionais.
- Feedback das operações.
- Estados de carregamento.
- Tratamento de erros.
- Layout responsivo.

Utilize português brasileiro em toda a interface.

## 7. SEGURANÇA

- Nunca exponha chaves de API.
- Não comite arquivos `.env`.
- Utilize `.env.example`.
- Proteja os documentos.
- Valide permissões no backend.
- Implemente autenticação segura.
- Não permita acesso entre grupos familiares.
- Não execute operações destrutivas sem proteção.
- Preserve os dados existentes.

## 8. GITHUB — REGRA OBRIGATÓRIA

Repositório:

https://github.com/alesauer/malukiviagens.git

Após cada módulo concluído e validado:

1. Verifique o Git.
2. Execute os testes.
3. Atualize a documentação.
4. Faça commit com Conventional Commits.
5. Faça push para o repositório remoto.
6. Confirme o resultado.
7. Continue o desenvolvimento.

Nunca utilize force push.

Nunca envie segredos.

Se o GitHub estiver indisponível, registre a pendência e continue o trabalho local.

## 9. EXECUÇÃO CONTÍNUA

Trabalhe continuamente até concluir todas as fases.

Não pare após:
- Criar o esqueleto do projeto.
- Criar o banco.
- Criar o login.
- Criar o dashboard.
- Implementar apenas o frontend.
- Implementar apenas a API.

O objetivo é entregar um produto integrado e funcional.

Mantenha uma lista de tarefas atualizada em `IMPLEMENTATION_STATUS.md`, indicando:

- Funcionalidades concluídas.
- Funcionalidades pendentes.
- Testes executados.
- Problemas encontrados.
- Próximas atividades.

Ao concluir uma fase, avance imediatamente para a próxima.

Não espere uma nova solicitação para continuar.

## 10. CRITÉRIOS DE CONCLUSÃO

O projeto somente poderá ser considerado concluído quando:

1. Todos os módulos previstos estiverem implementados.
2. Frontend e backend estiverem integrados.
3. Banco de dados estiver funcional.
4. Docker Compose executar a aplicação corretamente.
5. Os testes obrigatórios estiverem passando.
6. Autenticação e permissões estiverem funcionando.
7. Upload e download de documentos estiverem funcionando.
8. Modo offline estiver implementado e testado.
9. Integrações estiverem implementadas ou claramente documentadas como dependentes de credenciais externas.
10. Backups e restauração estiverem testados.
11. Documentação estiver atualizada.
12. Código estiver publicado no GitHub.

Ao finalizar, apresente um relatório contendo:

- Funcionalidades implementadas.
- Arquitetura final.
- Tecnologias utilizadas.
- Testes executados e resultados.
- Integrações configuradas e pendentes de credenciais.
- Como executar localmente.
- Como implantar na VPS Hostinger.
- Link do repositório atualizado.
- Pendências reais, se existirem.

**INSTRUÇÃO FINAL: Comece lendo toda a documentação e inspecionando o repositório. Em seguida, inicie a implementação e prossiga de forma autônoma até atingir os critérios de conclusão. Não entregue apenas um planejamento: implemente o sistema.**