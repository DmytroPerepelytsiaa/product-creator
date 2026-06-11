# syntax=docker/dockerfile:1
# Build context must be the monorepo root: docker build -f apps/notifications/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS pruner
RUN pnpm add -g turbo@2
COPY . .
RUN turbo prune notifications --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=notifications

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app .
WORKDIR /app/apps/notifications
CMD ["node", "dist/main.js"]
