# ORION — Sistema de Controle de Demandas

Aplicação web desenvolvida para substituir planilhas compartilhadas de equipe, oferecendo visibilidade clara sobre o que está aberto, quem é o responsável e o que já venceu.

---

## 👥 Guia do Usuário (Para Usuários Finais)

Esta seção foi feita para você que deseja apenas colocar a aplicação para rodar e gerenciar seus projetos e demandas no dia a dia, sem precisar entender de código.

### 🚀 Como executar a aplicação

Você pode escolher entre duas formas simples de rodar o ORION:

#### Opção 1: Com Docker (Mais Rápido)
Se já possui o [Docker Desktop](https://www.docker.com/) instalado e aberto:

```bash
docker compose up --build
```
> Acesse no navegador: 👉 **[http://localhost:3005](http://localhost:3005)**

---

#### Opção 2: Sem Docker (Usando Bun — Windows, Linux e macOS)

Se você não usa Docker, basta ter o runtime **[Bun](https://bun.sh/)** instalado.

**1. Instalar o Bun (caso ainda não tenha):**
* **Windows** (no PowerShell):
  ```powershell
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```
* **Linux / macOS** (no Terminal):
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

**2. Instalar as dependências e iniciar:**
No terminal, dentro da pasta do projeto:

```bash
# Instala as dependências do backend e frontend de uma só vez
bun run setup

# Inicia a aplicação (Frontend + Backend integrados)
bun run dev
```

> Pronto! Acesse no navegador: 👉 **[http://localhost:3005](http://localhost:3005)**
> *(O banco de dados SQLite e os dados de exemplo são criados automaticamente no primeiro acesso).*

---

### ✨ Funcionalidades e Recursos

1. **Acesso Seguro e Rápido**
   - **Cadastro Simples:** Crie sua conta informando nome completo, e-mail e senha na tela de cadastro.
   - **Login Direto:** Autentique-se com facilidade e acesse seu ambiente de trabalho protegido.

2. **Visão Geral no Painel (Dashboard)**
   - **Métricas no topo:** Veja rapidamente o **Total de Demandas**, quantas estão **Abertas** e quantas estão **Atrasadas**.
   - **Destaque Visual para Demandas Vencidas:** Qualquer demanda cujo prazo expirou e ainda não foi finalizada recebe destaque visual imediato em vermelho para chamar a atenção da equipe.

3. **Gestão de Projetos e Demandas**
   - **Criação de Projetos:** Cadastre seus projetos com nome e descrição opcional.
   - **Cadastro de Demandas:** Crie tarefas informando descrição, prazo, status inicial, projeto vinculado e quem é o responsável pela execução.
   - **Edição Completa & Exclusão:** Altere prazos, descrições, responsáveis ou exclua tarefas quando necessário.
   - **Mudança Rápida de Status:** Atualize o progresso da tarefa (`Aberta` ➔ `Em andamento` ➔ `Concluída`) diretamente na listagem.

4. **Filtros Inteligentes**
   - **Filtro por Responsável:** Veja apenas as tarefas de um colaborador específico.
   - **Filtro por Status:** Visualize apenas o que está aberto, em andamento ou concluído.
   - **Filtros Combináveis:** Combine responsável e status para encontrar exatamente o que precisa em segundos.

---

## 💻 Guia Técnico e Arquitetura (Para Desenvolvedores)

Esta seção detalha o funcionamento interno, arquitetura, stack e modos de desenvolvimento.

### 🛠️ Modos de Execução para Desenvolvimento

#### Opção 1: Desenvolvimento com Docker e Hot-Reload (Recomendado)
Sobe o Express na porta 3005 integrado com o Vite em modo middleware. Qualquer alteração no backend ou frontend reflete instantaneamente:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
*(ou execute o atalho: `bun run dev:docker`)*

#### Opção 2: Desenvolvimento Local sem Docker
Necessário ter o runtime [Bun](https://bun.sh/) instalado:

```bash
# Instalação rápida das dependências (raiz do projeto)
bun run setup

# Iniciar backend e frontend integrados
bun run dev
```
Acesse em: **[http://localhost:3005](http://localhost:3005)**.

#### 🌱 Carga Inicial de Dados (Seed Automático & Manual)

O sistema executa o **seed automaticamente** no primeiro boot (seja via Docker ou localmente) caso o banco de dados esteja vazio.

Caso queira forçar a execução do seed manualmente:

```bash
# Localmente (na raiz do projeto ou dentro de backend/)
bun run seed

# Ou via Docker (com o container em execução)
docker compose exec orion bun run seed
```

> **Credenciais padrão dos usuários do seed:**
> - E-mails: `ana.paula.ribeiro@cosmos.com`, `beatriz.nogueira@cosmos.com`, `carlos.menezes@cosmos.com`, etc.
> - Senha padrão: `novo123456789`

---

### 🏛️ Arquitetura e Estrutura de Código

A aplicação adota o padrão **MVC em camadas**, com convenção de nomenclatura inspirada no Nest.js, porém **sem decorators, sem reflection e sem containers de injeção de dependência complexos**.

```text
backend/src/
├── auth/          # Controller, Service, Middleware JWT e rotas de autenticação
├── usuario/       # Controller, Service, Repository, rotas e tipos de Usuários
├── projeto/       # Controller, Service, Repository, rotas e tipos de Projetos
├── demanda/       # Controller, Service, Repository, rotas e tipos de Demandas
├── database/      # Conexão SQLite nativa (bun:sqlite), DDL inicial e seed
└── server.ts      # Setup do Express, middlewares, rotas /api e integração Vite/SPA
```

- **Fluxo estrito de dados:** `Routes ➔ Controller ➔ Service ➔ Repository ➔ SQLite`.
- **Injeção de dependências simples:** Feita manualmente via construtor.
- **Separation of Concerns:** Controllers gerenciam HTTP (`req`/`res`), Services contêm as regras de negócio puras, Repositories isolam o SQL.

---

### 🧰 Stack Tecnológica & Decisões de Design

- **Backend:** [Bun](https://bun.sh/) + [Express 5](https://expressjs.com/) + TypeScript.
- **Banco de Dados:** [SQLite](https://sqlite.org/) embarcado via módulo nativo `bun:sqlite` (`journal_mode = WAL`, `PRAGMA foreign_keys = ON`). Mapeamento completo disponível em [SCHEMA.md](SCHEMA.md).
- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vite.dev/) + TypeScript + [Tailwind CSS v4](https://tailwindcss.com/) + componentes [coss UI](https://coss.com/ui).
- **Autenticação & Senhas:**
  - JWT gerado via biblioteca `jsonwebtoken` e validado via `auth.middleware.ts` no header `Authorization: Bearer <token>`.
  - Hashing seguro nativo com `Bun.password.hash()` e `Bun.password.verify()` (sem dependência externa tipo bcrypt).
- **Integridade de Status:** Utilização de enum fixo (`aberta` | `em_andamento` | `concluida`) garantido via restrição `CHECK` no SQLite e tipos TypeScript.
- **Cálculo de Atraso:** Avaliado no momento da consulta (`prazo < hoje` e `status != 'concluida'`), dispensando cron jobs ou colunas redundantes.
- **Empacotamento Unificado:** Um único container Docker e uma única porta pública (**3005**). Em produção, o Express entrega a API em `/api` e os arquivos estáticos compilados do React em `/`.

---

### 🚫 O que ficou de fora (Decisões de Escopo / YAGNI)

- Recuperação de senha por e-mail, confirmação de conta e OAuth/Login social.
- Paginação server-side complexa, WebSockets, filas de background, cache distribuído (Redis) ou multi-tenancy.
- Testes automatizados extensivos (mantido simples conforme requisitos do MVP).

---

## 🤖 Registro de uso de IA

Consulte o arquivo [DEVELOPMENT.md](DEVELOPMENT.md) para o registro detalhado de arquitetura, decisões e uso de IA no projeto.
