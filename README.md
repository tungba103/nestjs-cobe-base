# Thao Nhi Clinic — Backend

REST API for a pediatric clinic: patient records, visits, prescriptions, service usage, and a role/permission-based admin.

Built with [NestJS](https://nestjs.com) 10, [Prisma](https://www.prisma.io) 5, PostgreSQL 15 and TypeScript.

---

## Requirements

- Node.js 20 (the Docker image pins 20.16.0)
- Yarn
- Docker + Docker Compose (recommended — brings up Postgres for you)

## Setup

```bash
cp .env.example .env
yarn install
```

### Run with Docker (recommended)

```bash
make init-dev          # build + start `nestjs_backend` and `postgres_db`
make connect           # shell into the backend container
```

The container intentionally has **no start command** — it stays alive so you can work inside it. Once you're in the shell:

```bash
npx prisma migrate deploy   # or `migrate dev` while iterating on the schema
npx prisma db seed          # creates users, roles and permissions
yarn start:dev
```

### Run on the host

Point the app at the published Postgres port. In `.env`, remove the duplicate `DATABASE_HOST` line so that:

```dotenv
DATABASE_HOST=localhost
DATABASE_PORT=5439        # must match POSTGRES_PORT
```

Then:

```bash
docker compose up -d postgres
npx prisma migrate dev
npx prisma db seed
yarn start:dev
```

> `.env.example` declares `DATABASE_HOST` twice (`localhost`, then `postgres`). The last one wins, which is right inside Docker and wrong on the host.

### Verify

| | |
|---|---|
| API | http://localhost:9999/api/v1 |
| Swagger | http://localhost:9999/swagger |

The app itself always listens on port **9100** inside the container; `BACKEND_PORT` (default `9999`) is the port published on your machine. Running on the host without Docker, use `http://localhost:9100`.

Seeded logins: `admin` / `123456` and `thaonhi` / `thaonhi` — both hold the `ADMIN` role, which is granted every permission.

## Environment variables

| Variable | Purpose |
|---|---|
| `BACKEND_PORT` | Host port mapped to the container's 9100 |
| `POSTGRES_PORT` | Host port mapped to Postgres' 5432 |
| `DATABASE_HOST` / `DATABASE_PORT` | `postgres` / `5432` inside Docker, `localhost` / `POSTGRES_PORT` on the host |
| `DATABASE_NAME` / `DATABASE_USER` / `DATABASE_PASSWORD` | Postgres credentials |
| `DATABASE_URL` | Composed from the above; what Prisma reads |

## Scripts

```bash
yarn start:dev        # nodemon + ts-node (transpile-only, so no type checking)
yarn build            # nest build — use this to actually type-check
yarn start:prod       # node dist/main
yarn lint             # eslint --fix
yarn format           # prettier --write
yarn test             # jest (no specs written yet)
```

### Make targets

```bash
make init-dev         # docker compose up --build -d
make connect          # docker exec -it nestjs_backend bash
make db-connect       # psql into postgres_db
make remove           # docker compose down -v — drops the database volume
```

### Database

```bash
npx prisma migrate dev --name <name>    # create a migration and regenerate the client
npx prisma generate                     # regenerate the client only
npx prisma db seed                      # prisma/seed.ts — users, roles, permissions
npx prisma studio                       # browse the data
```

The numbered files in `prisma/` are optional demo-data scripts, run one at a time:

```bash
npx ts-node prisma/2_seed_customers.ts
npx ts-node prisma/3_seed_product_service.ts
npx ts-node prisma/4_seed_visits.ts
```

## API

All routes are prefixed with `/api/v1`. Every endpoint except `POST /auth/login` and `POST /auth/refresh` requires an `Authorization: Bearer <accessToken>` header.

| Resource | Endpoints |
|---|---|
| `auth` | `POST /login`, `POST /refresh`, `POST /logout` |
| `users` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id` |
| `roles` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id` |
| `customers` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id` |
| `products`, `product-categories` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id` |
| `services`, `service-categories` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id` |
| `visits` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` (cancels) |

Nothing is hard-deleted — every table has an `isActive` flag, and `DELETE /visits/:id` just sets the visit's status to `CANCELLED`.

### Response envelope

Success and failure share one shape, applied globally by `ResponseInterceptor` and `AllExceptionFilter`:

```jsonc
{ "message": "Success", "statusCode": 200, "result": { /* payload */ } }
{ "message": "Customer not found", "statusCode": 400, "result": null }
```

List endpoints put pagination inside `result`:

```jsonc
{
  "message": "Success",
  "statusCode": 200,
  "result": { "page": 1, "pageSize": 10, "totalPage": 5, "total": 47, "data": [] }
}
```

They accept `?page=`, `?pageSize=` (max 100) and `?search=`.

### Authorization

`AuthService.login` returns an `accessToken` (valid 1 year) plus a `refreshToken` (30 days, stored in `refresh_tokens`). Controllers are annotated with `@AuthClaims()` to require a valid token, and individual handlers with `@Permissions(...)` to require a permission code; a user passes if **any** of their roles grants **any** of the listed permissions. Category endpoints reuse the `*_PRODUCT` / `*_SERVICE` permissions of their parent resource.

Permissions are defined in two places that must be kept in sync — the `PermissionNameType` enum in `prisma/schema.prisma` and the matching TypeScript enum in `src/constants/permissions/`. After adding one, migrate and re-run the seed.

## Project layout

```
prisma/                  schema, migrations, seeds
src/
  configs/               JWT module options
  constants/             shared constants, permission enum
  decorators/            @AuthClaims(), @Permissions()
  dtos/                  shared pagination/search DTOs
  filter-exceptions/     global exception filter
  guards/                JWT and permission guards
  interceptors/          global response interceptor
  middlewares/           request logger
  models/                shared types
  modules/               auth, users, roles, customers, products, services, visits
  prisma/                PrismaService (Nest provider)
  utils/                 pagination helper, winston logger
```

Each module follows the same shape — `*.controller.ts`, `*.service.ts`, `*.module.ts` and a `dto/` folder with `create-`, `update-` and `filter-` DTOs. Services expose the public use cases first, then a `// Repository methods` section wrapping Prisma.

`tsconfig.json` defines `@n-*` path aliases (`@n-constants`, `@n-guards`, `@n-utils`, …) over `src/`.

## Data model

`Customer` has many `Visit`s. A visit records the diagnosis, symptoms, medical history and advice, and links to at most one `Prescription` (of `PrescriptionItem`s, each referencing a `Product` with per-dose instructions) and one `ServiceUsage` (of `ServiceUsageItem`s, each referencing a `Service`). Line items copy the name and price at the time of the visit so later catalogue edits don't rewrite history, and the visit's `totalAmount` is recomputed from both totals inside a transaction on update.

Access control runs `User → UsersOnRoles → Role → RolesOnPermissions → Permission`.

## Notes

- `strictNullChecks` and `noImplicitAny` are disabled, and `yarn start:dev` transpiles without type checking — run `yarn build` before pushing.
- The JWT secret is currently hardcoded as `yourSecretKey` in `src/configs/jwt.options.ts` and `src/guards/jwt-auth.guard.ts`. Move it to the environment before deploying.
- Allowed CORS origins are hardcoded in `src/main.ts`.
- Users created through `POST /users` are stored with an unhashed password while login compares with bcrypt, so they cannot sign in yet — only seeded accounts work.
