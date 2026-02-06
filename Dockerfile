# ======================
# 1. Builder
# ======================
FROM oven/bun:1.1.0 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY prisma ./prisma
RUN bunx prisma generate

COPY . .
RUN bun run build


# ======================
# 2. Production
# ======================
FROM oven/bun:1.1.0-slim AS production
WORKDIR /app


COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD ["bun", "dist/main.js"]
