FROM node:20-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
# Install turbo globally
RUN npm install -g turbo
# Copy only necessary files for turbo prune (.dockerignore handles exclusions)
COPY . .
# Prune the workspace for the server app
RUN turbo prune --scope=server --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Enable corepack and pin pnpm version to match package.json
RUN corepack enable
RUN corepack prepare pnpm@9.15.3 --activate

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Build the server
RUN pnpm turbo build --filter=server...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

# Copy only necessary runtime files
COPY --from=installer --chown=hono:nodejs /app/apps/server/dist ./apps/server/dist
COPY --from=installer --chown=hono:nodejs /app/apps/server/package.json ./apps/server/package.json
COPY --from=installer --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=hono:nodejs /app/packages ./packages

USER hono

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["node", "apps/server/dist/index.js"]

