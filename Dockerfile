# 1. Build stage
FROM oven/bun:1.0 as builder
WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json bun.lock ./

# Install dependencies
RUN bun install 

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN bunx prisma generate

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun run build

# 2. Production stage
FROM oven/bun:1.0-slim as production
WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json bun.lock ./

# Install production dependencies
RUN bun install  

# Copy the build output from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["bun", "dist/main.js"]