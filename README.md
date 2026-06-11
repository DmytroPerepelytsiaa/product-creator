# Product Creator

A small product-catalog application built as a **Turborepo monorepo** with two
NestJS microservices, a Next.js frontend, PostgreSQL (via Drizzle ORM) and
**RabbitMQ** for inter-service messaging.

Creating or deleting a product persists it in Postgres and publishes an event to
RabbitMQ; a separate **Notifications** service consumes those events and logs
them.

```
                 HTTP (REST)                AMQP (RabbitMQ)
   ┌────────┐   ───────────►   ┌──────────┐   ──────────►   ┌───────────────┐
   │  web   │                  │ products │                 │ notifications │
   │ Next.js│   ◄───────────   │ NestJS   │   product.*     │ NestJS        │
   └────────┘    JSON          └────┬─────┘   events        └───────────────┘
                                    │ SQL
                                    ▼
                              ┌──────────┐
                              │ Postgres │
                              └──────────┘
```

## Tech stack

| Concern            | Choice                                                        |
| ------------------ | ------------------------------------------------------------- |
| Language           | TypeScript (strict)                                           |
| Monorepo           | Turborepo + pnpm workspaces                                   |
| Backend framework  | NestJS 11                                                     |
| Database           | PostgreSQL 16                                                 |
| ORM & migrations   | Drizzle ORM + drizzle-kit                                     |
| Message broker     | RabbitMQ (NestJS RMQ transport)                               |
| Frontend           | Next.js 16 (App Router), React 19                             |
| UI                 | Tailwind CSS v4 + Radix UI primitives                         |
| Data fetching/form | TanStack Query, React Hook Form, Zod                          |

## Repository layout

```
apps/
  products/          NestJS REST API · Drizzle/Postgres · RabbitMQ producer
  notifications/     NestJS microservice · RabbitMQ consumer (logs events)
  web/               Next.js frontend (product list, create & delete dialogs)
packages/
  contracts/         Shared event contracts + Product/pagination types
  eslint-config/     Shared ESLint config (base / nest / next-js)
  typescript-config/ Shared tsconfig presets (base / nestjs / nextjs)
docker-compose.yml   Local infrastructure: Postgres + RabbitMQ
```

The `@repo/contracts` package is the single source of truth for the messaging
schema (queue name, routing patterns, event payloads) so the producer and
consumer can never drift apart. It also exports the `Product` / pagination types
consumed by the frontend.

## Prerequisites

- **Node.js ≥ 18** (developed on 22)
- **pnpm 9** — `corepack enable && corepack prepare pnpm@9 --activate`
- **Docker** (for Postgres + RabbitMQ)

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Start infrastructure (Postgres + RabbitMQ)
docker compose up -d

# 3. Create the env files (defaults already point at the compose services)
cp apps/products/.env.example      apps/products/.env
cp apps/notifications/.env.example apps/notifications/.env
cp apps/web/.env.example           apps/web/.env.local

# 4. Apply database migrations
pnpm --filter products db:migrate:dev

# 5. Run everything (products :3001, notifications, web :3000)
pnpm dev
```

Then open **http://localhost:3000**.

- Products API: `http://localhost:3001/api`
- RabbitMQ management UI: `http://localhost:15672` (user `app` / pass `app`)

> The `.env.example` files use the credentials from `docker-compose.yml`, so the
> defaults work out of the box. A pre-generated migration lives in
> `apps/products/drizzle/`.

### Try it

Create a product and watch the **notifications** service log the event:

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Wireless keyboard","description":"Compact 65%","price":79.99}'

curl "http://localhost:3001/api/products?page=1&limit=10"
```

## API

Base URL: `http://localhost:3001/api`

| Method   | Path                       | Description                                 |
| -------- | -------------------------- | ------------------------------------------- |
| `POST`   | `/products`                | Create a product → emits `product.created`  |
| `GET`    | `/products?page=&limit=`   | Paginated list (newest first)               |
| `DELETE` | `/products/:id`            | Delete a product → emits `product.deleted`  |
| `GET`    | `/health`                  | Liveness + DB connectivity check            |

**Create payload**

```jsonc
{ "name": "string (1–255)", "description": "string? (≤2000)", "price": 79.99 }
```

**Paginated response**

```jsonc
{
  "data": [ { "id": "uuid", "name": "...", "description": "...", "price": 79.99,
              "createdAt": "ISO", "updatedAt": "ISO" } ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1,
            "hasNextPage": false, "hasPreviousPage": false }
}
```

## Messaging

- Queue: `notifications_queue` (durable)
- Events: `product.created`, `product.deleted`

Events are published with NestJS's `ClientProxy.emit` (fire-and-forget). They are
a **best-effort side effect**: if the broker is unavailable, the API logs the
failure but still returns success, since the product change is already committed.

## Scripts

Run from the repo root (Turborepo orchestrates the workspaces):

| Command                                 | Description                          |
| --------------------------------------- | ------------------------------------ |
| `pnpm dev`                              | Run all apps in watch mode           |
| `pnpm build`                            | Build all apps and packages          |
| `pnpm lint`                             | Lint everything                      |
| `pnpm check-types`                      | Type-check everything                |
| `pnpm --filter products test`           | Unit tests for the Products service  |
| `pnpm --filter products db:generate`    | Generate a migration from the schema |
| `pnpm --filter products db:migrate:dev` | Apply migrations (local, via tsx)    |
| `pnpm --filter products db:studio`      | Open Drizzle Studio                  |

## Production notes

Choices that lean toward a production-ready setup rather than the minimum:

- **Validation everywhere** — `class-validator` DTOs on the API, Zod on the
  frontend form, and Zod-validated environment variables that fail fast at boot.
- **Migrations, not auto-sync** — schema changes are versioned SQL files applied
  by a runtime migration runner (no drizzle-kit dependency in the container).
- **Shared contracts package** — producer, consumer and UI share one typed
  contract; a payload change is a compile error, not a runtime surprise.
- **Layered backend** — controller → service → repository, with DB rows mapped to
  a stable public shape at the boundary.
- **Graceful shutdown** — Nest shutdown hooks drain the Postgres pool; prices are
  stored as `NUMERIC(12,2)` to avoid floating-point drift.
- **Health check** with a real DB ping, and CORS scoped to the web origin.
- **Frontend UX** — loading skeletons, error + empty states, refetch via TanStack
  Query, and accessible Radix dialogs with confirmation on delete.

### Containerising the apps

Each app ships a production `Dockerfile` (multi-stage `turbo prune` build).
Build from the repo root, e.g.:

```bash
docker build -f apps/products/Dockerfile -t product-creator-products .
```

The Products image runs migrations before starting the API.
