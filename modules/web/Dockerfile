# Dockerfile for @rbi/web (Next.js)
# Based on devenv configuration: Node.js 24, pnpm 10

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
COPY packages/eslint-config/ ./packages/eslint-config/

# Copy Web module
COPY modules/web/package.json ./modules/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/types/ ./packages/types/
COPY modules/web/ ./modules/web/

# Build types package first
RUN pnpm --filter @rbi/types build

# Build Next.js app
RUN pnpm --filter @rbi/web build

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
COPY modules/web/package.json ./modules/web/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts from builder
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/modules/web/.next ./modules/web/.next
COPY --from=builder /app/modules/web/public ./modules/web/public

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Expose Next.js port
EXPOSE 3000

WORKDIR /app/modules/web

CMD ["pnpm", "start"]
