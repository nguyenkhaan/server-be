# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.6-alpine AS base

# Install only essential runtime dependencies
# openssl3: needed for Node.js crypto modules
# postgresql-client: only needed for Prisma migrations (can be removed if migrations run separately)
RUN apk add --no-cache openssl3 postgresql-client && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Dependencies stage - uses BuildKit cache for faster rebuilds
FROM base AS deps
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --ignore-scripts

# Build stage - install all dependencies including dev
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client before build
ENV DATABASE_URL="file:./dev.db"
RUN bun run prisma:generate

# Build the application
RUN bun run build && \
    # Remove unnecessary files after build
    rm -rf node_modules src test scripts *.md .editorconfig .eslintrc.cjs .prettierrc

# Production dependencies stage - only runtime dependencies
FROM base AS production-deps
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --production --ignore-scripts

# Final production image
FROM base AS release
# Set NODE_ENV to production early
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=production-deps /app/package.json ./package.json

# Copy built artifacts
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/prisma ./prisma

RUN chown -R bun:bun /app
USER bun

ENV PORT=4000
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun --version || exit 1

CMD ["bun", "dist/main.js"]