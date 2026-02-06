# ======================
# 1. Build stage
# ======================
FROM node:20.19-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install deps (include dev deps for build)
RUN npm ci

# Copy prisma schema & generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

# Build NestJS
RUN npm run build


# ======================
# 2. Production stage
# ======================
FROM node:20.19-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install prod deps only
RUN npm ci --omit=dev

# Copy Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy build output
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4000

# Start app
CMD ["node", "dist/main.js"]
