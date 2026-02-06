# =========================
# 1️⃣ Build stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL deps (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build NestJS
RUN npm run build


# =========================
# 2️⃣ Runtime stage
# =========================
FROM node:20-alpine

WORKDIR /app

# Copy only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# (Optional) Prisma
# COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/main.js"]
