FROM oven/bun:1 AS base

WORKDIR /app

COPY backend/package.json backend/bun.lock ./backend/
COPY frontend/package.json frontend/bun.lock ./frontend/

RUN cd backend && bun install --frozen-lockfile \
  && cd ../frontend && bun install --frozen-lockfile

COPY . .

FROM base AS dev

WORKDIR /app/backend

ENV NODE_ENV=development
ENV PORT=3005
ENV SQLITE_PATH=/app/data/orion.db

EXPOSE 3005

CMD ["bun", "--watch", "src/server.ts"]

FROM base AS prod

WORKDIR /app/frontend
RUN bun run build

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3005
ENV SQLITE_PATH=/app/data/orion.db

EXPOSE 3005

CMD ["bun", "src/server.ts"]
