# Stage 1: Builder
FROM node:24-alpine AS builder

WORKDIR /app

# Copy necessary files for dependency installation and Prisma generation
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies needed for 'prisma generate' and 'nest build')
RUN npm install

# Generate the Prisma client
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS production

WORKDIR /app

# Copy production-only dependencies and the built application from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma/

# Ensure the generated Prisma client files are present in the final image
# Depending on your prisma schema and project structure, you might need to copy specific generated files.
# The 'npm run build' step in the builder stage usually handles this if configured correctly (e.g., via nest-cli.json assets).
# The above COPY of the prisma directory generally includes the necessary engine files.

# Expose the port the NestJS app runs on (default is 3000)
EXPOSE 4000

# Command to run the application in production mode
CMD [ "npm", "run", "start:prod" ]
