FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json bun.lock ./
COPY frontend/package.json frontend/bun.lock ./frontend/

RUN bun install --frozen-lockfile \
  && cd frontend && bun install --frozen-lockfile

COPY . .

FROM base AS dev

ENV PORT=3005
ENV SQLITE_PATH=/app/data/orion.db

EXPOSE 3005 5173

CMD ["bun", "scripts/dev.ts"]

FROM base AS prod

WORKDIR /app/frontend
RUN bun run build

WORKDIR /app

ENV PORT=3005
ENV SQLITE_PATH=/app/data/orion.db

EXPOSE 3005

CMD ["bun", "src/server.ts"]
