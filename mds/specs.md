# TRAVEL MANAGER
## Especificação Funcional do Sistema — Versão 1.0

**Tipo de produto:** SaaS pessoal e familiar para gerenciamento de viagens  
**Versão:** 1.0 — Levantamento inicial consolidado  
**Idioma:** Português do Brasil  
**Plataforma:** Aplicação Web PWA, mobile-first  
**Hospedagem:** VPS própria — Hostinger  
**Banco de dados:** PostgreSQL

---

# 1. Visão geral do produto

O Travel Manager será uma aplicação web destinada ao planejamento, organização, acompanhamento e gerenciamento de viagens pessoais e familiares.

A plataforma permitirá centralizar informações sobre viagens, destinos, atrações turísticas, restaurantes, hospedagens, passagens, transportes, documentos, despesas, roteiros e compromissos.

O sistema terá funcionalidades colaborativas, permitindo que os integrantes de um grupo familiar participem do planejamento e da execução das viagens.

Também contará com inteligência artificial integrada para auxiliar na pesquisa de destinos, criação de roteiros, interpretação de documentos e consulta às informações cadastradas.

O Travel Manager deverá funcionar online e oferecer modo offline completo, com sincronização posterior.

# 2. Objetivos do sistema

- Centralizar todas as informações das viagens.
- Facilitar o planejamento de viagens familiares.
- Organizar destinos, atrações e roteiros.
- Gerenciar reservas e documentos.
- Controlar orçamentos e despesas.
- Facilitar a colaboração entre familiares.
- Disponibilizar informações importantes durante a viagem.
- Utilizar inteligência artificial para auxiliar no planejamento.
- Preservar o histórico das experiências familiares.
- Permitir exportação e backup dos dados.

# 3. Público-alvo e usuários

## 3.1 Público-alvo

Uso pessoal e familiar.

O sistema não terá inicialmente foco comercial ou oferta de assinaturas para terceiros.

## 3.2 Grupo familiar

Um usuário principal poderá criar um grupo familiar e convidar os demais integrantes.

Características:

- Cada familiar terá uma conta individual.
- O grupo terá um administrador.
- O administrador será responsável pela gestão dos integrantes e convites.
- Todos os integrantes poderão visualizar, criar, editar e excluir informações.
- Todas as viagens serão compartilhadas automaticamente com o grupo.
- A arquitetura deverá permitir futuramente que um usuário participe de vários grupos familiares.

## 3.3 Participantes externos

Será possível cadastrar pessoas que não fazem parte do grupo familiar.

Exemplos:
- Amigos.
- Parentes.
- Convidados.
- Outros participantes de uma viagem.

Essas pessoas poderão ser cadastradas sem possuir conta. Também será possível convidá-las para criar uma conta e participar do planejamento.

# 4. Requisitos funcionais

## RF01 — Autenticação e usuários

O sistema deverá permitir:

- Cadastro de usuários com nome, e-mail e senha.
- Login com e-mail e senha.
- Recuperação de senha por e-mail.
- Encerramento de sessão.
- Gerenciamento de perfil.
- Foto de perfil.
- Associação a grupo familiar.

## RF02 — Gerenciamento familiar

O sistema deverá permitir:

- Criar grupo familiar.
- Definir administrador.
- Convidar integrantes.
- Aceitar e recusar convites.
- Consultar integrantes.
- Gerenciar participação no grupo.
- Compartilhar automaticamente as viagens.

## RF03 — Cadastro e gerenciamento de viagens

Cada viagem deverá possuir:

- Nome.
- Categoria.
- Destino principal.
- Data de início.
- Data de término.
- Participantes.
- Descrição.
- Observações.
- Imagem de capa.

Categorias previstas:

- Férias.
- Viagem nacional.
- Viagem internacional.
- Final de semana.
- Feriado.
- Passeio de um dia.
- Excursão.
- Viagem profissional.
- Outros.

Formas de cadastro:

1. Manual, por formulário.
2. Assistida por IA, utilizando descrição em linguagem natural.

A IA deverá preparar os dados para revisão e confirmação antes de salvar.

Não haverá limite artificial de quantidade de viagens.

## RF04 — Situação das viagens

Cada viagem poderá assumir os seguintes estados:

| Status | Descrição |
|---|---|
| Rascunho | Cadastro inicial |
| Planejamento | Organização da viagem |
| Confirmada | Reservas realizadas |
| Em andamento | Viagem acontecendo |
| Realizada | Viagem concluída |
| Cancelada | Viagem cancelada |

O sistema poderá sugerir alterações automáticas de status conforme as datas, permitindo ajustes manuais.

## RF05 — Destinos múltiplos

Uma viagem poderá possuir vários destinos.

Cada destino deverá permitir:

- Cidade.
- Estado ou região.
- País.
- Data de chegada.
- Data de saída.
- Descrição.
- Hospedagem associada.
- Observações.
- Pontos turísticos.
- Restaurantes.
- Atividades.

## RF06 — Catálogo permanente de destinos

O sistema deverá manter um catálogo independente das viagens.

Cada destino poderá possuir:

- Dados geográficos.
- Descrição turística.
- Pontos de interesse.
- Restaurantes.
- Hospedagens.
- Favoritos.
- Avaliações.
- Histórico de visitas.
- Fotografias ou links externos.
- Recomendações da família.

Um mesmo destino poderá ser reutilizado em diferentes viagens.

## RF07 — Catálogo de atrações e restaurantes

O sistema deverá manter um catálogo permanente de estabelecimentos e atrações.

Informações:

- Nome.
- Categoria.
- Descrição.
- Endereço.
- Coordenadas.
- Telefone.
- Site.
- Horários.
- Faixa de preços.
- Links para reservas.
- Fotografias ou links externos.
- Favoritos.
- Avaliações.
- Histórico de visitas.
- Observações.

Será possível cadastrar manualmente ou pesquisar informações externas.

## RF08 — Avaliações

Cada familiar poderá registrar sua própria avaliação.

Informações:

- Nota de 1 a 5 estrelas.
- Comentário.
- Data da visita.
- Identificação do avaliador.

O sistema calculará uma avaliação média familiar e permitirá registrar uma recomendação coletiva.

## RF09 — Roteiros e atividades

A organização deverá combinar:

- Catálogo de atividades sem data definida.
- Programação diária.

Cada atividade poderá possuir:

- Nome.
- Categoria.
- Endereço.
- Coordenadas.
- Data.
- Horário.
- Duração estimada.
- Valor estimado.
- Observações.
- Link externo.
- Avaliação.

Será possível organizar a sequência das atividades e alterar a programação.

## RF10 — Pesquisa turística

O sistema oferecerá duas modalidades:

**Pesquisa manual:** o usuário pesquisa e cadastra informações.

**Pesquisa assistida por IA:** o usuário solicita uma pesquisa turística sobre determinado destino.

A IA deverá pesquisar e organizar informações sobre:

- Pontos turísticos.
- Museus.
- Restaurantes.
- Gastronomia.
- Compras.
- Passeios.
- Excursões.
- Transporte.
- Recomendações.

As informações deverão apresentar suas fontes e ser revisadas pelo usuário antes de incorporadas ao catálogo.

## RF11 — Hospedagens

Cada hospedagem deverá possuir:

- Estabelecimento.
- Tipo de hospedagem.
- Endereço.
- Destino associado.
- Check-in.
- Check-out.
- Código de reserva.
- Contato.
- Telefone.
- E-mail.
- Valores.
- Forma de pagamento.
- Situação do pagamento.
- Links.
- Observações.

Anexos permitidos:

- Voucher.
- Comprovante de reserva.
- Comprovante de pagamento.
- Nota fiscal.
- Contratos.
- Outros documentos.

## RF12 — Passagens aéreas

Cada voo poderá possuir:

- Companhia aérea.
- Número do voo.
- Aeroporto de origem.
- Aeroporto de destino.
- Data e horário de partida.
- Data e horário de chegada.
- Conexões.
- Passageiros.
- Assentos.
- Classe tarifária.
- Bagagem.
- Localizador.
- Valores.
- Situação do pagamento.
- Observações.

Anexos:

- Bilhetes eletrônicos.
- Cartões de embarque.
- Comprovantes.
- Confirmações de reserva.

## RF13 — Transportes terrestres

Gerenciamento de:

- Carro alugado.
- Ônibus.
- Trem.
- Transfer.
- Táxi.
- Aplicativos de transporte.

Informações:

- Tipo de transporte.
- Empresa.
- Origem.
- Destino.
- Datas.
- Horários.
- Distância estimada.
- Valor.
- Reserva.
- Contato.
- Dados do veículo, quando aplicável.

Anexos de contratos, vouchers, bilhetes e comprovantes.

## RF14 — Reservas em restaurantes

Cada reserva poderá conter:

- Restaurante.
- Endereço.
- Data.
- Horário.
- Quantidade de pessoas.
- Participantes.
- Responsável.
- Telefone.
- Código de confirmação.
- Link da reserva.
- Valor estimado.
- Pagamento antecipado.
- Situação da reserva.
- Observações.

Também haverá anexos, lembretes e associação com o roteiro diário.

## RF15 — Ingressos e passeios pagos

Gerenciamento de:

- Museus.
- Parques.
- Shows.
- Eventos.
- Excursões.
- Passeios guiados.
- Atrações turísticas.

Informações:

- Atração.
- Data.
- Horário.
- Participantes.
- Quantidade de ingressos.
- Tipo de ingresso.
- Valor.
- Fornecedor.
- Código de reserva.
- Situação do pagamento.
- Política de cancelamento.

Anexos:

- Ingressos.
- QR Codes.
- Vouchers.
- Comprovantes.

Os documentos deverão estar disponíveis para consulta offline quando previamente armazenados no dispositivo.

## RF16 — Gestão financeira

O módulo financeiro deverá permitir:

- Definir orçamento total.
- Definir orçamento por categoria.
- Registrar despesas.
- Identificar responsável pelo gasto.
- Associar despesas a familiares.
- Dividir despesas.
- Registrar pagamentos realizados.
- Registrar valores pendentes.
- Consultar gastos por categoria.
- Consultar gastos por pessoa.
- Comparar orçamento previsto e realizado.

Categorias iniciais:

- Passagens.
- Hospedagem.
- Alimentação.
- Transporte.
- Passeios.
- Compras.
- Seguro-viagem.
- Documentação.
- Outras despesas.

A moeda de referência será sempre o real brasileiro (R$). Valores estrangeiros serão convertidos manualmente.

## RF17 — Integração financeira

Ao registrar pagamentos em hospedagens, voos, restaurantes, transportes ou ingressos, o sistema poderá sugerir o lançamento de uma despesa.

O usuário deverá confirmar, alterar ou dispensar a sugestão.

O sistema deverá evitar despesas duplicadas.

## RF18 — Situação dos pagamentos

O MVP utilizará controle simplificado:

- Pago.
- Pendente.

Não haverá controle de parcelas ou cronograma financeiro no MVP.

## RF19 — Seguro-viagem

Cada seguro poderá conter:

- Seguradora.
- Apólice.
- Segurados.
- Coberturas.
- Limites de cobertura.
- Vigência.
- Valor.
- Telefones de assistência.
- Contatos de emergência.
- Procedimentos de acionamento.

Anexos de apólices, cartões de assistência e comprovantes.

## RF20 — Documentos pessoais e familiares

Área centralizada para documentos de cada familiar.

Exemplos:

- Passaporte.
- RG.
- CPF.
- Vistos.
- CNH.
- Carteiras de vacinação.
- Seguro-viagem.
- Autorizações para menores.

Cada documento poderá possuir:

- Tipo.
- Número.
- Emissão.
- Validade.
- Observações.
- Arquivo anexado.

## RF21 — Documentos gerais das viagens

Permitir armazenar documentos relacionados a:

- Reservas.
- Passagens.
- Hospedagens.
- Transportes.
- Ingressos.
- Comprovantes.
- Roteiros.
- Outros arquivos.

Formatos previstos: PDF, JPG e PNG.

## RF22 — Compartilhamento de documentos

Todos os integrantes do grupo familiar poderão visualizar, criar, editar e excluir os documentos pessoais e gerais cadastrados no grupo.

O acesso será restrito aos integrantes autenticados.

## RF23 — Importação inteligente de documentos

O usuário poderá anexar documentos para interpretação por IA.

A IA deverá:

1. Identificar o tipo de documento.
2. Extrair informações.
3. Identificar datas, horários e valores.
4. Identificar passageiros e códigos de reserva.
5. Preparar o preenchimento dos campos.
6. Permitir revisão.
7. Salvar somente após confirmação.

Deverá haver identificação de possíveis documentos duplicados.

## RF24 — Mapas e rotas

O sistema deverá integrar mapas e serviços de localização para:

- Visualizar atrações.
- Visualizar restaurantes.
- Visualizar hospedagens.
- Visualizar pontos de interesse.
- Calcular distâncias.
- Estimar tempos de deslocamento.
- Montar rotas com múltiplos pontos.
- Reorganizar a sequência das visitas.
- Abrir navegação no Google Maps ou Waze.

## RF25 — Previsão meteorológica

O sistema deverá apresentar previsão do tempo por destino e dia da viagem.

Informações:

- Temperatura mínima.
- Temperatura máxima.
- Condição climática.
- Chuva.
- Nebulosidade.

Não serão implementadas sugestões automáticas de reorganização por clima no MVP.

## RF26 — Assistente de inteligência artificial

O sistema contará com assistente de IA integrado.

Funcionalidades:

- Sugerir atrações.
- Sugerir restaurantes.
- Criar roteiros.
- Considerar datas e distâncias.
- Considerar interesses e idades dos participantes.
- Estimar custos.
- Analisar orçamentos.
- Sugerir alternativas.
- Resumir reservas.
- Interpretar documentos.
- Responder perguntas sobre viagens.
- Realizar pesquisas externas.
- Auxiliar no preenchimento de cadastros.

A IA poderá consultar automaticamente os dados e documentos cadastrados, conforme a decisão do usuário.

Ações que alterem registros deverão exigir confirmação.

## RF27 — Checklist da viagem

O sistema oferecerá modelos automáticos e listas personalizadas.

Exemplos:

- Comprar passagens.
- Reservar hospedagem.
- Contratar seguro.
- Verificar documentos.
- Comprar ingressos.
- Organizar bagagem.
- Realizar check-in.
- Confirmar reservas.

Cada tarefa poderá possuir:

- Nome.
- Responsável.
- Prazo.
- Prioridade.
- Situação.
- Observações.
- Anexos.

## RF28 — Organização de bagagem

O sistema deverá oferecer listas individuais por familiar.

Cada item poderá possuir:

- Descrição.
- Categoria.
- Quantidade.
- Situação de preparação.
- Observações.

Categorias:

- Roupas.
- Higiene.
- Eletrônicos.
- Medicamentos.
- Acessórios.
- Outros.

Haverá modelos reutilizáveis por tipo e duração de viagem, além de sugestões da IA.

Não haverá controle de peso ou franquia de bagagem no MVP.

## RF29 — Contatos de emergência

Cada participante poderá possuir:

- Nome do contato.
- Telefone.
- Relação com o participante.
- Observações.

As informações deverão estar disponíveis offline.

Não haverá módulo de informações médicas.

## RF30 — Calendário e compromissos

Calendário mensal com:

- Viagens.
- Voos.
- Hospedagens.
- Passeios.
- Reservas.
- Transportes.
- Compromissos.
- Prazos.

## RF31 — Integração Google Agenda

Permitir exportar compromissos para o Google Agenda.

A integração será unidirecional.

Também será considerada exportação no formato ICS.

## RF32 — Álbuns Google Fotos

Cada viagem poderá possuir um ou mais links de álbuns do Google Fotos.

Informações:

- Nome.
- Link.
- Descrição.
- Data de criação.
- Associação com viagem ou destino.

Os arquivos de mídia permanecerão no Google Fotos.

## RF33 — Notificações

Canais:

- Central de notificações.
- E-mail.
- Push PWA.

Eventos:

- Voos.
- Hospedagens.
- Passeios.
- Reservas.
- Documentos.
- Pagamentos pendentes.
- Compromissos.

O sistema deverá permitir configurar notificações e antecedência dos lembretes.

## RF34 — Modo offline

A PWA deverá permitir:

- Consultar viagens.
- Consultar destinos.
- Consultar roteiros.
- Consultar reservas.
- Consultar documentos baixados.
- Consultar contatos.
- Registrar despesas.
- Criar atividades.
- Editar roteiros.
- Registrar informações.

Quando a conexão retornar, as alterações deverão ser sincronizadas com o servidor.

Deverá existir mecanismo de resolução de conflitos entre alterações feitas offline por diferentes usuários.

## RF35 — Dashboard

O Dashboard será a tela inicial após o login.

Deverá apresentar:

- Todas as viagens.
- Viagens próximas.
- Viagens em andamento.
- Viagens realizadas.
- Calendário.
- Indicadores financeiros.
- Orçamentos.
- Despesas.
- Próximos compromissos.
- Pendências.
- Notificações.

A interface poderá destacar compromissos do dia sem criar um Modo Viagem separado.

## RF36 — Relatórios

Indicadores:

- Quantidade de viagens.
- Destinos visitados.
- Países visitados.
- Gastos totais.
- Gastos por viagem.
- Gastos por categoria.
- Gastos por familiar.
- Orçamento previsto versus realizado.
- Evolução dos gastos.

Exportações:

- PDF.
- Excel.

## RF37 — Encerramento de viagens

Ao finalizar uma viagem, permitir:

- Alterar status para realizada.
- Registrar avaliação geral.
- Registrar comentários.
- Consolidar gastos.
- Registrar destinos visitados.
- Identificar atividades realizadas.
- Avaliar atrações e restaurantes.
- Associar álbuns Google Fotos.
- Gerar relatório final em PDF.

## RF38 — Busca global

Pesquisa tradicional por:

- Nome da viagem.
- Destino.
- País.
- Período.
- Categoria.
- Status.
- Participantes.

Pesquisa inteligente por linguagem natural.

Exemplos:

- Qual hotel reservamos em Santiago?
- Quanto gastamos com alimentação?
- Quais restaurantes visitamos?
- Quais viagens fizemos em 2026?

As respostas da IA deverão apresentar referências aos registros consultados.

## RF39 — Importação e exportação

Permitir:

- Exportar relatórios em PDF.
- Exportar dados em Excel.
- Exportar viagens em JSON.
- Exportar dados em CSV.
- Importar viagens em JSON e CSV.
- Validar dados antes da importação.
- Identificar duplicidades.
- Confirmar operações.

Também deverá existir backup completo para restauração em outra VPS.

## RF40 — Backup e restauração

Backups automáticos:

- Frequência semanal.
- Retenção dos últimos quatro backups.
- PostgreSQL.
- Documentos anexados.
- Compactação.
- Criptografia.

Backup manual:

- Geração de arquivo completo.
- Download pelo navegador.
- Inclusão do banco e documentos.
- Possibilidade de restauração em outra VPS.

A cópia externa será realizada manualmente pelo usuário, mediante download para seu computador.

## RF41 — Histórico de alterações

Registrar:

- Usuário responsável.
- Operação.
- Data e horário.
- Tipo de informação.
- Registro afetado.

Operações:

- Criação.
- Edição.
- Exclusão.

O histórico será consultável pelos familiares e não permitirá recuperar registros excluídos.

## RF42 — Exclusão de registros

A exclusão será definitiva.

O sistema deverá solicitar confirmação antes de excluir.

A exclusão de arquivos deverá respeitar os relacionamentos e evitar arquivos órfãos.

## RF43 — Personalização visual

Permitir:

- Tema claro.
- Tema escuro.
- Personalização de cores.
- Foto de perfil.
- Capa do grupo familiar.
- Capa das viagens.

As preferências visuais serão individuais.

# 5. Navegação e estrutura de módulos

O menu deverá ser compacto e adaptado ao celular.

Estrutura proposta:

1. Início.
2. Viagens.
3. Reservas.
4. Financeiro.
5. Documentos.
6. Explorar.
7. Família.
8. Assistente IA.

As funcionalidades secundárias serão agrupadas dentro dos módulos.

A interface utilizará navegação inferior para as funções principais e menu complementar para as demais.

# 6. Requisitos não funcionais

## RNF01 — Responsividade

Interface mobile-first, compatível com navegadores modernos.

## RNF02 — PWA

A aplicação deverá permitir instalação no celular e oferecer recursos offline.

## RNF03 — Segurança

- HTTPS.
- Senhas armazenadas com hash seguro.
- Autenticação JWT.
- Controle de acesso por grupo.
- Proteção de documentos.
- Validação de arquivos enviados.
- Proteção contra acesso não autorizado.
- Registro de operações relevantes.

## RNF04 — Privacidade

Todos os integrantes terão acesso aos documentos do grupo, conforme decisão do usuário.

Os dados enviados a serviços externos deverão utilizar mecanismos de proteção e controle de acesso.

## RNF05 — Persistência

Banco de dados PostgreSQL e armazenamento de arquivos em volume persistente na VPS.

## RNF06 — Disponibilidade

A aplicação deverá oferecer sincronização confiável entre os dispositivos.

## RNF07 — Integridade

O sistema deverá evitar inconsistências entre reservas, despesas, documentos e roteiros.

## RNF08 — Escalabilidade

A arquitetura deverá permitir crescimento da quantidade de viagens, destinos, atividades e documentos sem limitações artificiais na aplicação.

## RNF09 — Portabilidade

Os dados deverão poder ser exportados e restaurados em outra VPS.

## RNF10 — Idioma e localização

- Português brasileiro.
- Moeda padrão: real.
- Datas: DD/MM/AAAA.
- Horário: 24 horas.
- Fuso horário padrão: America/Sao_Paulo.

# 7. Arquitetura tecnológica aprovada

| Camada | Tecnologia |
|---|---|
| Frontend | React |
| Linguagem | TypeScript |
| Build | Vite |
| Interface | Tailwind CSS |
| Componentes | shadcn/ui |
| Aplicação móvel | PWA |
| Backend | Python |
| Framework | FastAPI |
| ORM | SQLAlchemy |
| Autenticação | JWT |
| Banco de dados | PostgreSQL |
| Armazenamento | Volume persistente Docker |
| Infraestrutura | Hostinger VPS |
| Containerização | Docker |
| Orquestração | Docker Compose |

## 7.1 Infraestrutura

A infraestrutura existente será aproveitada.

Não será necessária a contratação de outra VPS ou banco de dados externo.

Os documentos serão armazenados diretamente em volume persistente da VPS, sem utilização de MinIO no MVP.

# 8. Integrações externas previstas

As integrações deverão fazer parte da primeira versão:

| Serviço | Finalidade |
|---|---|
| Google Maps | Mapas, locais, distâncias e rotas |
| Google Fotos | Links dos álbuns |
| Google Agenda | Exportação de compromissos |
| OpenAI | Assistente e interpretação de documentos |
| Pesquisa web | Informações turísticas atualizadas |
| Serviço meteorológico | Previsão do tempo |
| Serviço de e-mail | Convites, recuperação e notificações |
| Push PWA | Notificações no celular |

As integrações estarão sujeitas a disponibilidade, limites de API, políticas dos provedores e eventuais custos.

# 9. Regras de negócio consolidadas

1. Todas as viagens pertencem a um grupo familiar.
2. Todas as viagens são compartilhadas automaticamente.
3. Todos os integrantes possuem permissões iguais sobre as informações das viagens.
4. O administrador gerencia o grupo e os convites.
5. Participantes externos poderão ser cadastrados.
6. Destinos e atrações poderão ser reutilizados em diferentes viagens.
7. Uma viagem poderá conter vários destinos.
8. Uma atividade poderá estar inicialmente sem data.
9. Despesas originadas de reservas deverão exigir confirmação.
10. Os valores financeiros serão controlados em reais.
11. A exclusão de registros será definitiva.
12. As alterações deverão gerar histórico de auditoria.
13. A IA poderá consultar dados e documentos cadastrados.
14. Alterações sugeridas pela IA deverão exigir confirmação.
15. Documentos pessoais serão compartilhados com todo o grupo familiar.
16. Dados offline deverão ser sincronizados posteriormente.
17. Os backups deverão incluir banco e arquivos.

# 10. Pontos que precisam de detalhamento nas próximas etapas

Embora a visão funcional esteja consolidada, alguns assuntos exigirão decisões específicas antes do desenvolvimento.

## 10.1 Modelo de permissões para convidados

Definir como participantes externos convidados para uma viagem terão acesso sem necessariamente receber todas as permissões do grupo familiar.

## 10.2 Sincronização offline

Definir:
- Estratégia de sincronização.
- Identificação de alterações.
- Resolução de conflitos.
- Exclusões realizadas offline.
- Armazenamento local.
- Expiração e segurança dos dados no dispositivo.

## 10.3 Modelo de dados

Definir entidades, relacionamentos, cardinalidades e regras de integridade.

## 10.4 Armazenamento de documentos

Definir estrutura de diretórios, nomenclatura, limites de arquivos, criptografia e recuperação.

## 10.5 Inteligência artificial

Definir:
- Modelos utilizados.
- Custos.
- Limites de utilização.
- Estratégia de pesquisa externa.
- Proteção de documentos enviados.
- Registro de consultas.
- Referências utilizadas nas respostas.

## 10.6 Integrações

Definir APIs, autenticação, chaves, limites de uso e custos dos serviços externos.

## 10.7 Exclusão definitiva e backups

Definir como uma exclusão será refletida nos backups e qual será o comportamento durante uma restauração.

## 10.8 Notificações

Definir regras de agendamento, frequência, antecedência e tratamento de notificações duplicadas.

# 11. Diretrizes de desenvolvimento

O desenvolvimento deverá ser incremental, com entregas funcionais.

Recomenda-se:

1. Estruturar o projeto e os containers.
2. Criar o banco de dados e as migrações.
3. Implementar autenticação e grupo familiar.
4. Implementar viagens e destinos.
5. Implementar roteiros e atividades.
6. Implementar reservas e documentos.
7. Implementar financeiro.
8. Implementar mapas e calendário.
9. Implementar modo offline.
10. Implementar integrações.
11. Implementar assistente de IA.
12. Implementar relatórios e backups.

Cada módulo deverá possuir testes automatizados.

# 12. Resultado esperado

O Travel Manager deverá ser uma plataforma familiar completa, capaz de acompanhar todo o ciclo de uma viagem:

**Planejamento → Organização → Reservas → Preparação → Execução → Encerramento → Histórico.**

A plataforma deverá centralizar as informações, permitir colaboração entre familiares, oferecer acesso pelo celular e preservar os dados em infraestrutura própria.

---

**Documento:** Especificação Funcional do Travel Manager  
**Versão:** 1.0  
**Status:** Levantamento inicial consolidado  
**Próxima etapa:** Detalhamento funcional e especificação técnica.
