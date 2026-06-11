# syntax=docker/dockerfile:1
# Build context must be the monorepo root: docker build -f apps/products/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# --- Prune the workspace to just what `products` needs ---------------------
FROM base AS pruner
RUN pnpm add -g turbo@2
COPY . .
RUN turbo prune products --docker

# --- Install dependencies and build ---------------------------------------
FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=products

# --- Runtime --------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app .
WORKDIR /app/apps/products
EXPOSE 3001
# Apply pending migrations, then start the API.
CMD ["sh", "-c", "node dist/database/migrate.js && node dist/main.js"]
