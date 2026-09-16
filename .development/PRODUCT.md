# ORION: Guia do Produto & Manual do Usuário

O **ORION** organiza tarefas, responsáveis e datas de entrega de projetos em equipe.

Substitui o controle em planilhas por uma interface web onde cada participante visualiza suas tarefas e os prazos definidos.

---

## Problemas comuns no uso de planilhas

Nas rotinas de equipe, o uso de planilhas para controle de pendências costuma gerar problemas frequentes:
* **Falta de clareza:** Linhas apagadas sem querer, fórmulas quebradas e dados desatualizados.
* **Ambiguidade de donos:** Dificuldade em identificar quem responde por cada ação.
* **Prazos perdidos:** Atrasos percebidos apenas após o vencimento.
* **Excesso de reuniões de status:** Tempo gasto apenas para checar o andamento de tarefas.

O ORION centraliza esses dados em uma interface com filtros por projeto, responsável e status.

---

## Funcionalidades Principais

| Funcionalidade | Descrição |
|---|---|
| **Alertas de atraso** | Demandas vencidas recebem destaque visual em vermelho e contador dedicado no topo da tela. |
| **Responsabilidade clara** | Toda demanda tem um responsável nominal e um projeto vinculado. |
| **Edição rápida de status** | Atualização de status com um clique direto na listagem. |
| **Notificações automáticas** | Alertas ao receber atribuição de tarefa, menção ou mudança de status. |
| **Exportação CSV** | Download dos dados filtrados em formato `.csv` compatível com Excel e Google Planilhas. |
| **Visualização em tabela ou cards** | Alternância entre visualização em tabela e cards, com suporte a modo claro e escuro. |

---

## 🏢 Casos de Uso na Prática

O ORION adapta-se à dinâmica de diferentes áreas e rotinas:

```mermaid
flowchart TD
    subgraph "Casos de Uso no Dia a Dia"
        A["Auditorias & Conformidade<br/><i>(Documentos, certidões e prazos fiscais)</i>"]
        B["Reuniões de Alinhamento<br/><i>(Dailies, Weeklies e repasse de status)</i>"]
        C["Operações & Atendimento Interno<br/><i>(Solicitações, acessos e chamados de suporte)</i>"]
        D["Controle de Vencimentos Críticos<br/><i>(Renovação de contratos, licenças e alvarás)</i>"]
        E["Transição & Férias de Colaboradores<br/><i>(Redistribuição rápida de pendências)</i>"]
    end
```

### 1. Auditorias, Fechamentos e Conformidade Fiscal
* **Cenário:** A equipe precisa levantar dezenas de documentos comprobatórios (balancetes, certidões, contratos e guias de recolhimento) com prazos rígidos.
* **Como usar o ORION:**
  1. Cada pendência é cadastrada com seu código e data limite.
  2. O auditor ou gestor filtra por **Status: Atrasadas** para identificar imediatamente os gargalos.
  3. Com um clique no botão **Exportar**, gera-se a planilha oficial com a posição do dia para apresentação.

### 2. Reuniões de Alinhamento Semanal (Weekly / Daily)
* **Cenário:** O líder de equipe reúne o time para repassar as entregas da semana.
* **Como usar o ORION:**
  1. Ative a visualização em **Modo Cards**.
  2. Filtre pelo nome de cada colaborador individualmente.
  3. Conforme as entregas são confirmadas, altere o status de **Aberta** para **Em andamento** ou **Concluída** diretamente na tela.
  4. Surgiu uma nova tarefa na reunião? Clique em **Nova demanda** e atribua na hora.

### 3. Controle de Vencimento de Licenças, Certidões e Contratos
* **Cenário:** Manter a empresa em dia com licenças de software, alvarás de funcionamento e certidões negativas de débito.
* **Como usar o ORION:**
  1. Cadastre cada certidão com sua data final de validade.
  2. O painel monitora as datas e avisa visualmente com antecedência quando um prazo expira.
  3. A equipe renova os itens antes de gerar impacto jurídico ou bloqueio de faturamento.

### 4. Gestão de Ausências e Redistribuição de Trabalho
* **Cenário:** Um membro da equipe entra de férias ou sai da empresa e suas tarefas precisam ser redistribuídas.
* **Como usar o ORION:**
  1. Filtre as demandas do colaborador ausente que ainda estão com status **Aberta** ou **Em andamento**.
  2. Edite as demandas e transfira a responsabilidade para o novo encarregado.
  3. O novo responsável recebe um alerta instantâneo na sua central de notificações.

---

## 🌟 Principais Recursos da Aplicação

### 1. 📊 Painel Geral de Controle (Dashboard)
* **Contadores de Destaque:**
  * **Total de Demandas:** Volume total de tarefas cadastradas sob sua gestão.
  * **Demandas Abertas:** Itens que ainda requerem ação da equipe.
  * **Demandas Atrasadas:** Destaque de urgência. Ao clicar no card de atrasadas, a listagem aplica o filtro de pendências vencidas automaticamente.
* **Busca Global Instantânea:** Digite qualquer palavra da descrição, nome do projeto, responsável ou data para encontrar tarefas instantaneamente.
* **Filtros Combinados:** Filtre simultaneamente por Projeto, Responsável e Status.
* **Alternância de Visualização:**
  * **Modo Tabela:** Ideal para quem prefere visualização em formato de planilha tradicional, com colunas alinhadas e botões rápidos.
  * **Modo Cards:** Ideal para navegação fluida em telas menores, celulares ou dinâmicas de reuniões visuais.

### 2. 📋 Gestão Completa de Demandas
* **Cadastro Rápido:** Formulário simples para definir Descrição, Projeto, Responsável, Prazo de Entrega e Status Inicial.
* **Seletor Visual de Datas:** Calendário interativo para seleção de prazos sem erro de digitação.
* **Página de Detalhes da Demanda:**
  * Visualização ampliada com badge de urgência se o item estiver atrasado.
  * Botão de cópia rápida do código da demanda (ex: `PEN-001`) para a área de transferência.
  * Histórico com data e hora exatas de quando a demanda foi aberta e quando ocorreu a última atualização.
  * Edição integral ou exclusão da demanda.

### 3. 📁 Organização por Projetos
* **Projetos Centralizados:** Crie projetos para agrupar demandas por iniciativas, clientes, setores ou áreas temáticas.
* **Proteção de Dados:** O sistema avisa e impede a exclusão acidental de projetos que ainda possuam tarefas atreladas, garantindo que nenhum histórico se perca.

### 4. 🔔 Central de Notificações
* **Sininho Inteligente na Barra Superior:** Exibe um contador visual sempre que houver novidades direcionadas a você.
* **Alertas de Atribuição e Mudança:** Saiba na hora quando alguém passou uma tarefa para o seu nome ou concluiu uma pendência.
* **Ação Rápida:** Botão para marcar todas as notificações como lidas com um clique.

### 5. 📥 Exportação de Relatórios para Excel
* **Exportação Personalizada:** O botão **Exportar** gera um arquivo no formato `.csv` contendo exatamente os dados que estão visíveis após a aplicação dos seus filtros de busca.
* **Compatibilidade Total:** Arquivo gerado com acentuação e formatação corretas, pronto para abrir diretamente no Microsoft Excel ou Google Planilhas.

### 6. 🌓 Tema Escuro e Claro (Dark/Light Mode)
* **Conforto Visual:** Alterne entre tema claro e escuro a qualquer momento pelo botão na barra superior. O sistema memoriza sua preferência automaticamente.

---

## 📱 Guia Rápido: Como Usar o ORION no Dia a Dia

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário / Colaborador
    participant P as ORION Platform
    
    U->>P: 1. Entrar com E-mail e Senha
    U->>P: 2. Visualizar Dashboard e Tarefas Atrasadas
    U->>P: 3. Criar Demanda ou Mudar Status para "Concluída"
    P-->>U: 4. Atualização Instantânea + Notificação aos Envolvidos
    U->>P: 5. Exportar Relatório CSV para a Reunião
```

### Passo 1: Acessar a Plataforma
1. Acesse o endereço do ORION no seu navegador.
2. Digite seu **e-mail corporativo** e sua **senha**.
3. Se for seu primeiro acesso, clique em **Cadastre-se**, preencha seu nome, e-mail e crie sua senha.

### Passo 2: Criar um Projeto (se necessário)
1. No topo da tela, clique no botão **Novo projeto**.
2. Informe o nome (ex: `Fechamento Fiscal 2026` ou `Expansão de Lojas`) e uma breve descrição.
3. Clique em **Salvar**.

### Passo 3: Cadastrar uma Nova Demanda
1. Clique no botão **Nova demanda**.
2. Preencha os campos:
   * **Descrição:** O que precisa ser feito de forma clara e objetiva.
   * **Projeto:** Selecione a qual projeto a demanda pertence.
   * **Responsável:** Escolha quem executará a tarefa.
   * **Prazo:** Escolha a data limite no calendário.
   * **Status:** Deixe como "Aberta" ou "Em andamento".
3. Clique em **Salvar**. O responsável receberá um alerta automaticamente.

### Passo 4: Atualizar e Concluir Tarefas
1. Na lista de demandas, você pode mudar o status de qualquer item a qualquer momento no seletor da coluna **Status**.
2. Ao selecionar **Concluída**, a demanda é finalizada e deixa de contar nas métricas de pendências abertas ou atrasadas.

### Passo 5: Filtrar e Gerar Relatórios
1. Use a barra de busca ou os seletores de **Projeto**, **Responsável** e **Status** para isolar o que deseja acompanhar.
2. Clique em **Exportar** no canto superior direito para baixar a planilha correspondente.

---

## ⚖️ Planilha Compartilhada vs. ORION

| Situação Cotidiana | Planilha Tradicional | ORION (PolarisTasks) |
|---|---|---|
| **Saber quem é o responsável** | Nomes digitados com abreviações ou erros que dificultam filtros | Lista padronizada de usuários com login individual |
| **Identificar o que está atrasado** | Depende de fórmulas manuais que costumam quebrar | Destaque automático em vermelho e contador em tempo real |
| **Duas pessoas editando juntas** | Conflitos de salvamento, travamento e perda de dados | Acesso simultâneo fluido e seguro |
| **Saber quando algo mudou** | Ninguém é avisado a menos que alguém mande mensagem | Notificações automáticas na tela ao receber uma tarefa |
| **Prestar contas para a diretoria** | Horas limpando a planilha antes da reunião | 1 clique para exportar a posição consolidada |

---

> O filtro de demandas atrasadas exibe itens cujo prazo já passou.
