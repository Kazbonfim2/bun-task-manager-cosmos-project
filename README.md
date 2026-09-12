# ORION — Sistema de Gestão e Controle de Demandas

[![CI](https://github.com/Kazbonfim2/bun-task-manager-cosmos-project/actions/workflows/ci.yml/badge.svg)](https://github.com/Kazbonfim2/bun-task-manager-cosmos-project/actions/workflows/ci.yml)
![Bun](https://img.shields.io/badge/Bun-1.3+-000?logo=bun)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss)
![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite)

Aplicação web moderna desenvolvida para substituir planilhas compartilhadas de equipe, oferecendo visibilidade em tempo real sobre demandas em aberto, responsáveis, prazos, histórico de discussões e notificações.

---

## 👥 Guia Rápido de Uso (Para Usuários Finais)

Se você quer apenas rodar a aplicação e gerenciar projetos e demandas da sua equipe no dia a dia, siga os passos abaixo.

### 🚀 Como colocar para rodar em 1 minuto

#### Opção 1: Com Docker (Recomendado — mais rápido)
Se você tem o [Docker Desktop](https://www.docker.com/) instalado:

```bash
docker compose up --build
```
> Acesse no seu navegador: 👉 **[http://localhost:3005](http://localhost:3005)**

---

#### Opção 2: Sem Docker (Usando Bun)
Se preferir rodar direto no seu computador (Windows, Linux ou Mac):

1. **Instale o Bun** (se ainda não tiver):
   - **Windows** (PowerShell): `powershell -c "irm bun.sh/install.ps1 | iex"`
   - **Linux / macOS** (Terminal): `curl -fsSL https://bun.sh/install | bash`
2. **Instale e inicie:**
   ```bash
   bun run setup   # Instala tudo de uma vez
   bun run dev     # Inicia o sistema
   ```
> Acesse no seu navegador: 👉 **[http://localhost:3005](http://localhost:3005)**
> *(O banco de dados e dados de exemplo são criados automaticamente no primeiro acesso).*

---

### ✨ O que você pode fazer no ORION

#### 1. 🔐 Acesso e Perfil
- **Cadastro e Login:** Crie sua conta com nome, e-mail e senha e acesse seu ambiente de trabalho seguro.
- **Tema Claro / Escuro:** Alterne entre os modos claro e escuro no cabeçalho conforme sua preferência visual.

#### 2. 📊 Painel de Controle (Dashboard)
- **Métricas em Destaque:** Acompanhe o total de demandas, quantas estão abertas e quantas estão em atraso.
- **Alerta de Atraso Inteligente:** Demandas com prazo vencido ganham destaque visual imediato em vermelho com contador de dias em atraso.
- **Visão em Lista ou Grade (Cards):** Alterne a exibição das demandas entre tabela detalhada ou cards visuais.
- **Filtros Combinados:** Filtre tarefas por responsável, por projeto e por status simultaneamente.
- **Busca Rápida:** Encontre qualquer demanda digitando palavras do título ou descrição.
- **Exportação para Planilha (CSV):** Baixe a lista de demandas com um clique para relatórios externos.

#### 3. 📁 Projetos e Demandas
- **Gestão de Projetos:** Crie novos projetos com nome e descrição para organizar o trabalho da equipe.
- **Cadastro Detalhado:** Cadastre demandas com **Título claro**, **Descrição detalhada**, projeto vinculado, prazo de entrega e responsável.
- **Mudança Rápida de Status:** Atualize o fluxo de trabalho (`Aberta` ➔ `Em andamento` ➔ `Concluída`) direto na listagem ou na tela de detalhes.
- **Edição e Exclusão Segura:** Modifique prazos, descrições e responsáveis a qualquer momento.

#### 4. 💬 Discussão e Comentários nas Demandas
- **Página de Detalhes da Demanda:** Clique em qualquer demanda para acessar a linha do tempo e o espaço de discussão.
- **Comentários da Equipe:** Compartilhe atualizações, tire dúvidas e registre o histórico da tarefa.
- **Edição pelo Autor:** Você pode editar ou excluir comentários que você mesmo enviou.

#### 5. 🔔 Notificações e Menções (`@usuario`)
- **Central de Notificações (Sino):** Receba avisos instantâneos quando uma tarefa for atribuída a você, quando o status mudar ou quando comentarem em sua demanda.
- **Marcação com `@`:** Digite `@` em um comentário ou descrição para abrir a lista de membros e marcar um colega.
- **Notificação Direta por Menção:** O usuário mencionado recebe um alerta específico indicando onde foi marcado.
- **Leitura Rápida:** Marque notificações individuais como lidas ou clique em "Ler todas".

---

## 💻 Guia Técnico e Arquitetura (Para Desenvolvedores)

Esta seção documenta a arquitetura, convenções, stack e como contribuir tecnicamente com o projeto.

### 🛠️ Modos de Desenvolvimento

```bash
# 1. Desenvolvimento com Docker e Hot-Reload (Express + Vite integrados)
bun run dev:docker
# (equivalente a: docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build)

# 2. Desenvolvimento Local com Bun
bun run setup    # instala dependências da raiz, backend e frontend
bun run dev      # sobe o servidor unificado em modo desenvolvimento

# 3. Rodar Testes Automatizados
bun run test     # executa a suíte de testes unitários e de integração
```

#### 🌱 Dados Iniciais (Seed)
- O seed é executado automaticamente na inicialização se o banco estiver vazio.
- Para rodar manualmente: `bun run seed` (ou `docker compose exec orion bun run seed`).
- **Credenciais padrão:** E-mails no formato `nome.sobrenome@cosmos.com` (ex: `ana.paula.ribeiro@cosmos.com`) com a senha `novo123456789`.

---

### 🏛️ Estrutura do Projeto & Arquitetura

O backend segue a arquitetura **MVC em camadas** (estilo Nest.js, mas sem injeção de dependência complexa ou decorators — apenas classes/objetos com injeção manual simples e TypeScript estrito).

```text
├── .github/workflows/ci.yml # Pipeline de CI (Bun test + Vite build)
├── backend/
│   ├── src/
│   │   ├── auth/           # Login, cadastro, geração/validação JWT
│   │   ├── usuario/        # CRUD e listagem pública de membros da equipe
│   │   ├── projeto/        # Gestão de projetos
│   │   ├── demanda/        # Regras de negócio, prazos e status de demandas
│   │   ├── comentario/     # CRUD de comentários e discussões em demandas
│   │   ├── notificacao/    # Serviço de eventos, utilitário de menções e alertas
│   │   ├── database/       # Conexão SQLite (bun:sqlite, WAL, FKs) e migrações
│   │   └── server.ts       # Setup do Express 5, rotas /api e SPA Vite
│   └── data/               # Arquivo de banco de dados orion.db
└── frontend/
    ├── src/
    │   ├── components/     # UI (Navbar, Dialogs, TextareaMencoes, TextoComMencoes)
    │   ├── pages/
    │   │   ├── Dashboard/        # Visão geral, filtros, grid/tabela, modais
    │   │   ├── DetalhesDemanda/  # Timeline, overview, comentários e menções
    │   │   ├── Login/ e Cadastro/# Telas de autenticação
    │   └── lib/            # Cliente HTTP (api.ts), sessão e status helpers
    └── index.html
```

---

### 🧰 Stack Tecnológica & Decisões Técnicas

| Camada | Tecnologia | Decisão Técnica / Motivação |
|---|---|---|
| **Runtime** | [Bun](https://bun.sh/) 1.3+ | Alta performance, inicialização ultrarrápida e runtime all-in-one para TS. |
| **Backend** | [Express 5](https://expressjs.com/) + TS | Roteamento simples, robusto e compatível com o ecossistema Node/Bun. |
| **Banco de Dados** | [SQLite](https://sqlite.org/) via `bun:sqlite` | Zero configuração de servidor externo, persistência local em arquivo único, modo `WAL` habilitado e foreign keys ativas. |
| **Frontend** | [React 19](https://react.dev/) + [Vite](https://vite.dev/) | Renderização rápida, bundle otimizado e tipagem completa. |
| **Estilização** | [Tailwind CSS v4](https://tailwindcss.com/) + coss UI | Componentes utilitários leves estilo shadcn/ui, sem runtime CSS pesado. |
| **Autenticação** | JWT + `Bun.password` | Hashes nativos ultra seguros (`Bun.password.hash`) sem precisar de `bcrypt` externo. |
| **Menções & Texto** | Regex nativa + parsing local | Detecção rápida de `@usuario` sem dependência de editores rich-text pesados (YAGNI). |
| **CI / CD** | GitHub Actions | Validação contínua de testes e compilação do build a cada push e PR. |

---

### ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz se desejar customizar as portas ou caminho do banco:

```env
# Porta da aplicação (padrão: 3005)
PORT=3005

# Caminho do banco SQLite (padrão: ./data/orion.db)
SQLITE_PATH=./data/orion.db

# Segredo para assinatura de JWTs
JWT_SECRET=orion_secret_key_change_in_production
```

---

### 🚫 Decisões de Escopo e Simplificações (YAGNI)

- **Sem Broker de Mensagens (Kafka/RabbitMQ):** Inserção de notificações e eventos síncronos no SQLite local levam `< 1ms`.
- **Sem Editores WYSIWYG complexos (Quill/Draft.js):** `<textarea>` com autocomplete flutuante atende 100% das menções com menos de 200 linhas de código.
- **Sem WebSockets pesados:** Polling inteligente com revalidação no foco da janela atualiza notificações de forma leve e resiliente.
- **Sem Reset de Senha por E-mail:** Autenticação enxuta focada no fluxo corporativo fechado de demandas.

---

## 🤖 Registro de Uso de IA

O registro de decisões técnicas e prompts arquiteturais encontra-se documentado no histórico de engenharia do repositório.
