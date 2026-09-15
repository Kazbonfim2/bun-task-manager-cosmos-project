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

COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY backend ./backend

EXPOSE 3005
USER bun

CMD ["bun", "backend/src/server.ts"]
