# Dockerfile for @rbi/api (NestJS)
# Based on devenv configuration: Node.js 24, pnpm 10, PostgreSQL 16

# Build stage
FROM node:24-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy shared packages
COPY packages/types/package.json ./packages/types/
COPY packages/tsconfig/ ./packages/tsconfig/

# Copy API module
COPY modules/api/package.json ./modules/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/types/ ./packages/types/
COPY modules/api/ ./modules/api/

# Build types package first
RUN pnpm --filter @rbi/types build

# Build API
RUN pnpm --filter @rbi/api build

# Production stage
FROM node:24-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package.json files for workspace resolution
COPY packages/types/package.json ./packages/types/
COPY packages/tsconfig/ ./packages/tsconfig/
COPY modules/api/package.json ./modules/api/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/modules/api/dist ./modules/api/dist

# Set environment variables
ENV NODE_ENV=production
ENV NEST_PORT=3001

# Expose API port
EXPOSE 3001

WORKDIR /app/modules/api

CMD ["node", "dist/main"]
