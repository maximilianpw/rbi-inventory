# Dockerfile for @rbi/web (TanStack Start)
# Based on devenv configuration: Node.js 24, pnpm 10

# Build stage
FROM node:24-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy shared packages
COPY packages/tsconfig/ ./packages/tsconfig/
COPY packages/eslint-config/ ./packages/eslint-config/

# Copy Web module
COPY modules/web/package.json ./modules/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY modules/web/ ./modules/web/

# Build TanStack Start app
RUN pnpm --filter @rbi/web build

# Production stage
FROM node:24-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package.json files for workspace resolution
COPY packages/tsconfig/ ./packages/tsconfig/
COPY modules/web/package.json ./modules/web/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts from builder
COPY --from=builder /app/modules/web/.output ./modules/web/.output
COPY --from=builder /app/modules/web/public ./modules/web/public

# Set environment variables
ENV NODE_ENV=production

# Expose web port
EXPOSE 3000

WORKDIR /app/modules/web

CMD ["pnpm", "start"]
