# ORION — Controle de Demandas

Substitui a planilha compartilhada da equipe: o que está aberto, com quem e o que já venceu.

## Como rodar

```bash
docker compose up --build
```

Acesse **http://localhost:3005**. A porta 3005 precisa estar livre.

Na primeira vez, use **Cadastre-se** (nome completo, e-mail e senha). Depois crie um projeto e as demandas.

Esse modo serve o `frontend/dist` gerado no build. Mudança no React não aparece até `docker compose up --build` de novo.

## Desenvolvimento com hot reload

Produção (`docker compose up --build`) serve o `dist` na **3005**. Mudança no React não aparece ali.

Para ver mudança ao salvar, use o compose de dev. Pare o container atual na 3005 antes de trocar.

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Ou: `bun run dev:docker`.

Abra **http://localhost:5173** — não a 3005. O Vite recarrega o React. A API fica em `http://localhost:3005/api` (o Vite encaminha `/api`).

Sem Docker:

```bash
bun install
cd frontend && bun install && cd ..
bun run dev
```

Mesma URL: **http://localhost:5173**.

## Decisões técnicas

- **Stack:** Bun + Express + TypeScript no backend; SQLite via `bun:sqlite` (arquivo local); Vite + React + TypeScript no frontend; coss UI + Tailwind CSS v4.
- **Arquitetura:** MVC em camadas (`routes → controller → service → repository → SQLite`). Classes simples, dependências no construtor, sem decorators e sem container de DI.
- **Auth:** cadastro e login com JWT (`jsonwebtoken`) no header `Authorization: Bearer <token>`. Senha com `Bun.password.hash()` / `Bun.password.verify()`.
- **Status da demanda:** enum fixo `aberta` | `em_andamento` | `concluida`. Não é texto livre, para evitar variantes tipo `ok` / `Ok` / `OK`.
- **Atrasada:** prazo anterior a hoje (data local) e status diferente de `concluida`.
- **Empacotamento:** um único container. Produção: Express serve API em `/api` e o `dist` na porta 3005. Dev: Vite na 5173 com hot reload.
- **Banco:** arquivo SQLite em `/app/data/orion.db` (volume Docker). Sem Postgres, MySQL ou serviço de banco externo.

## O que ficou de fora

- Esqueci minha senha, confirmação por e-mail e login social
- Paginação server-side, websockets, filas, cache, multi-tenant
- Testes automatizados (podem entrar depois, se pedido)

## Registro de uso de IA

<!-- Preencher manualmente com o uso real. -->
