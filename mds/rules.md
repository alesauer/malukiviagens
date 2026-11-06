# RULES.md — Travel Manager

## 1. Objetivo

Este documento define as regras obrigatórias para desenvolvimento, manutenção e evolução do Travel Manager.

Todos os desenvolvedores e agentes de inteligência artificial que trabalharem no projeto devem seguir estas orientações.

O projeto deverá manter código organizado, seguro, testável, documentado e versionado.

## 2. Repositório GitHub

**Repositório oficial:**

https://github.com/alesauer/malukiviagens.git

### Regras obrigatórias

1. Toda implementação concluída deverá ser enviada ao GitHub.
2. Nenhuma funcionalidade será considerada concluída sem validação e versionamento.
3. Antes de iniciar alterações, verificar o estado do repositório com `git status`.
4. Não sobrescrever alterações existentes sem autorização.
5. Realizar commits pequenos, objetivos e relacionados a uma implementação lógica.
6. Após testes e validações bem-sucedidos, executar commit e push.
7. Nunca utilizar `git push --force` ou sobrescrever o histórico remoto.
8. Nunca enviar arquivos contendo senhas, tokens, chaves de API ou outras credenciais.
9. Em caso de falha nos testes, não considerar a implementação concluída.
10. Em caso de falha de autenticação ou comunicação com GitHub, informar o problema. Nunca afirmar que o push foi realizado sem confirmação.

### Convenção de commits

Utilizar Conventional Commits:

- `feat:` nova funcionalidade.
- `fix:` correção de erro.
- `refactor:` melhoria estrutural.
- `test:` inclusão ou alteração de testes.
- `docs:` documentação.
- `style:` ajustes de interface ou formatação.
- `chore:` manutenção e configurações.

Exemplos:

`feat: implementa cadastro de viagens`

`fix: corrige sincronização offline`

`docs: atualiza documentação da API`

### Fluxo de implementação

1. Verificar alterações existentes.
2. Implementar a funcionalidade.
3. Executar testes.
4. Corrigir eventuais problemas.
5. Atualizar documentação.
6. Criar commit.
7. Enviar para o GitHub.
8. Confirmar que o push foi concluído.

## 3. Stack tecnológica oficial

Não alterar as tecnologias principais sem justificativa e aprovação.

### Frontend

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- shadcn/ui.
- PWA.

### Backend

- Python.
- FastAPI.
- SQLAlchemy.
- JWT.

### Banco de dados

- PostgreSQL.

### Infraestrutura

- Docker.
- Docker Compose.
- VPS Hostinger.

### Armazenamento

- Volumes persistentes Docker.
- Arquivos armazenados diretamente na VPS.
- PostgreSQL para metadados e referências dos arquivos.

Não adicionar MinIO ou outro serviço de armazenamento sem aprovação.

## 4. Arquitetura e organização

1. Manter frontend e backend organizados em módulos independentes.
2. Separar componentes visuais das regras de negócio.
3. Evitar duplicação de código.
4. Utilizar componentes reutilizáveis.
5. Manter separação entre rotas, serviços, modelos e schemas da API.
6. Centralizar configurações.
7. Não colocar regras de negócio diretamente nos componentes React.
8. Utilizar tipagem explícita no TypeScript.
9. Utilizar tipagem e validação de dados no Python.
10. Evitar dependências desnecessárias.

A arquitetura deverá permitir evolução incremental, sem necessidade de reescrever módulos existentes.

## 5. Padrões de desenvolvimento

- Código legível e organizado.
- Nomes de variáveis, funções e classes descritivos.
- Funções com responsabilidades específicas.
- Tratamento adequado de erros.
- Validação dos dados recebidos.
- Mensagens de erro claras.
- Evitar código duplicado.
- Não utilizar soluções temporárias como implementação definitiva.
- Não deixar funcionalidades incompletas sem documentar.

A comunicação com o usuário deverá ser em português brasileiro.

O código poderá utilizar nomenclatura técnica em inglês para manter consistência com as convenções das tecnologias.

## 6. Banco de dados

1. Utilizar PostgreSQL.
2. Utilizar SQLAlchemy para acesso aos dados.
3. Utilizar migrations com Alembic.
4. Nunca modificar o banco de produção manualmente sem migration correspondente.
5. Definir relacionamentos e integridade referencial.
6. Criar índices quando necessário.
7. Evitar consultas ineficientes.
8. Utilizar transações nas operações que envolvam múltiplas entidades.
9. Documentar alterações importantes no modelo de dados.
10. Considerar o isolamento dos dados por grupo familiar.

## 7. API Backend

- Utilizar FastAPI.
- Organizar endpoints por módulos.
- Validar entradas e saídas.
- Utilizar schemas Pydantic.
- Implementar autenticação e autorização.
- Documentar endpoints.
- Padronizar respostas e erros.
- Não expor informações internas desnecessárias.
- Não permitir acesso a dados de outros grupos familiares.

## 8. Frontend e experiência do usuário

O sistema deverá ser desenvolvido com abordagem mobile-first.

Regras:

1. Priorizar a experiência em smartphones.
2. Utilizar layout responsivo.
3. Manter consistência visual.
4. Utilizar componentes do shadcn/ui quando apropriado.
5. Evitar telas excessivamente carregadas.
6. Utilizar formulários com validação.
7. Apresentar feedback para operações realizadas.
8. Solicitar confirmação para exclusões.
9. Tratar estados de carregamento, erro e ausência de dados.
10. Manter acessibilidade e boa usabilidade.

Idioma padrão: português do Brasil.

Formato de data: DD/MM/AAAA.

Horário: 24 horas.

Moeda: real brasileiro (R$).

Fuso horário padrão: America/Sao_Paulo.

## 9. PWA e funcionamento offline

O Travel Manager deverá funcionar como PWA.

Regras:

- Implementar armazenamento local seguro.
- Permitir consulta offline de informações previamente sincronizadas.
- Permitir operações offline previstas na especificação.
- Registrar alterações pendentes.
- Sincronizar quando a conexão retornar.
- Tratar conflitos de sincronização.
- Evitar duplicidade de operações.
- Informar ao usuário quando estiver offline.
- Informar quando existirem alterações pendentes.

A estratégia de sincronização deverá preservar a integridade dos dados.

## 10. Segurança

Segurança é obrigatória em todas as implementações.

- Nunca armazenar senhas em texto puro.
- Utilizar hash seguro de senhas.
- Proteger endpoints.
- Validar permissões no backend.
- Implementar controle de acesso por grupo familiar.
- Utilizar HTTPS.
- Validar arquivos enviados.
- Restringir tipos e tamanhos de anexos.
- Proteger documentos pessoais.
- Não expor credenciais no frontend.
- Não armazenar segredos no Git.
- Utilizar variáveis de ambiente.
- Não registrar senhas ou tokens nos logs.
- Proteger downloads de documentos.
- Registrar operações importantes de auditoria.

A segurança não poderá depender exclusivamente de validações realizadas no frontend.

## 11. Inteligência artificial e integrações

A integração com serviços de IA deverá ocorrer pelo backend.

Regras:

1. Nunca expor chaves de API no frontend.
2. Centralizar chamadas externas.
3. Controlar custos e consumo.
4. Tratar indisponibilidade dos provedores.
5. Registrar erros de integração sem expor informações sensíveis.
6. Validar resultados produzidos pela IA.
7. Exigir confirmação antes de alterações nos dados.
8. Não considerar informações geradas pela IA como fatos sem validação.
9. Preservar referências das pesquisas externas.
10. Evitar enviar dados pessoais desnecessários aos provedores externos.

Integrações previstas:

- Google Maps.
- Google Fotos.
- Google Agenda.
- OpenAI.
- Pesquisa na internet.
- Serviço meteorológico.
- Serviço de e-mail.
- Notificações push.

## 12. Testes

Toda implementação deverá possuir testes compatíveis com sua complexidade.

### Backend

- Testes unitários.
- Testes de integração.
- Testes de endpoints.
- Testes de autenticação e autorização.
- Testes de regras de negócio.

### Frontend

- Testes de componentes.
- Testes de formulários.
- Testes de fluxos importantes.
- Testes de comportamento responsivo quando aplicável.

### Integração

- Testes de comunicação frontend/backend.
- Testes de persistência.
- Testes de sincronização.
- Testes de upload e download de documentos.

Não considerar uma funcionalidade concluída quando seus testes obrigatórios estiverem falhando.

## 13. Docker e infraestrutura

1. Todas as aplicações deverão ser executadas em containers.
2. Utilizar Docker Compose.
3. Manter volumes persistentes para dados.
4. Não armazenar dados importantes exclusivamente no filesystem temporário dos containers.
5. Utilizar healthchecks quando apropriado.
6. Separar configurações de desenvolvimento e produção.
7. Não utilizar credenciais diretamente nos arquivos Compose.
8. Documentar portas, redes e dependências.
9. Garantir que atualizações dos containers preservem os dados.
10. Não executar comandos destrutivos na VPS sem autorização.

## 14. Backup

O sistema deverá contemplar:

- Backup semanal automático.
- Retenção dos últimos quatro backups.
- Inclusão do PostgreSQL.
- Inclusão dos documentos anexados.
- Compactação.
- Criptografia.
- Download manual do backup completo.
- Procedimento de restauração em outra VPS.

Alterações na estrutura do banco ou armazenamento deverão considerar a compatibilidade com os processos de backup e restauração.

## 15. Documentação

Manter documentação atualizada.

Arquivos recomendados:

- `README.md`: apresentação, instalação e execução.
- `RULES.md`: regras permanentes do projeto.
- `CHANGELOG.md`: histórico de alterações relevantes.
- `.env.example`: variáveis necessárias sem credenciais reais.
- Documentação da API.
- Documentação do banco de dados.
- Instruções de Docker Compose.
- Procedimento de backup e restauração.

Toda nova funcionalidade relevante deverá atualizar a documentação correspondente.

## 16. Dependências

- Evitar bibliotecas desnecessárias.
- Preferir soluções consolidadas.
- Verificar compatibilidade antes de adicionar dependências.
- Registrar novas dependências.
- Não utilizar bibliotecas abandonadas sem justificativa.
- Manter versões controladas.
- Avaliar riscos de segurança.

## 17. Regras de negócio do Travel Manager

Toda implementação deverá respeitar a especificação funcional aprovada.

Principais premissas:

- Aplicação para uso pessoal e familiar.
- Grupo familiar com administrador.
- Contas individuais.
- Viagens compartilhadas automaticamente.
- Permissões colaborativas entre integrantes.
- Participantes externos.
- Destinos e atrações reutilizáveis.
- Múltiplos destinos por viagem.
- Controle financeiro em reais.
- Documentos compartilhados dentro do grupo.
- Exclusão definitiva.
- Histórico de auditoria.
- Assistente de IA integrado.
- Funcionamento offline.
- Backup e portabilidade dos dados.

Não criar funcionalidades que contrariem os requisitos aprovados sem autorização.

## 18. Evolução do projeto

O desenvolvimento deverá ocorrer de forma incremental.

Antes de implementar uma funcionalidade:

1. Verificar a especificação funcional.
2. Identificar dependências.
3. Planejar as alterações.
4. Implementar.
5. Testar.
6. Atualizar documentação.
7. Fazer commit.
8. Enviar para o GitHub.

Não realizar grandes reescritas sem necessidade.

Preservar funcionalidades existentes durante a evolução do sistema.

## 19. Regra principal

**Toda implementação concluída e validada deverá ser versionada e enviada para o repositório oficial do Travel Manager no GitHub:**

https://github.com/alesauer/malukiviagens.git

Nenhuma implementação será considerada concluída sem testes, documentação pertinente e confirmação do envio ao repositório, ressalvadas falhas externas de autenticação ou conectividade, que deverão ser informadas explicitamente.
