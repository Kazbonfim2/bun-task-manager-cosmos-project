# 1. Build frontend and backend dependencies
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY frontend/package.json frontend/bun.lock ./frontend/
COPY backend/package.json backend/bun.lock ./backend/

RUN cd frontend && bun install --frozen-lockfile
RUN cd backend && bun install --frozen-lockfile --production

COPY frontend ./frontend
RUN cd frontend && bun run build

# 2. Production runner
FROM oven/bun:1-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3005

RUN mkdir -p /app/data && chown -R bun:bun /app

COPY --from=builder --chown=bun:bun /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=bun:bun /app/frontend/dist ./frontend/dist
COPY --chown=bun:bun backend ./backend

EXPOSE 3005
USER bun

CMD ["bun", "backend/src/server.ts"]
