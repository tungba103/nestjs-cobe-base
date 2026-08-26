# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NestJS 10 + Prisma 5 + PostgreSQL backend for a pediatric clinic ("thaonhi-clinic-backend"). Branch `code-base` is the reusable starter; `clinic-v1` is the clinic-specific work. Swagger/DTO descriptions and seed data are partly in Vietnamese.

## Commands

```bash
yarn install

# Docker (postgres + backend container)
make init-dev      # docker compose up --build -d
make connect       # shell into nestjs_backend
make db-connect    # psql into postgres_db
make remove        # docker compose down -v (drops the volume)

yarn start:dev     # nodemon -> ts-node --transpile-only src/main.ts (no type-check!)
yarn build         # nest build
yarn start:prod    # node dist/main
yarn lint          # eslint --fix
yarn format        # prettier --write

npx prisma migrate dev --name <name>   # migrate + regenerate client
npx prisma generate
npx prisma db seed                     # runs prisma/seed.ts (users/roles/permissions)
npx ts-node prisma/2_seed_customers.ts # numbered seeds are standalone, run individually
```

Neither the Dockerfile `CMD` nor the compose service defines a start command — the container stays alive via `tty: true` and you run `yarn start:dev` inside it after `make connect`.

Tests: `yarn test` (jest, `rootDir: src`, matches `*.spec.ts`). **No test files exist yet** and `yarn test:e2e` points at a missing `test/jest-e2e.json`. Single test: `yarn test src/path/to/file.spec.ts` or `yarn test -t "test name"`.

## Environment

Copy `.env.example` → `.env`. Note it sets `DATABASE_HOST` twice (`localhost` then `postgres`); the second wins, which is correct inside Docker but wrong when running on the host — swap it to `localhost` and `DATABASE_PORT` to the mapped `POSTGRES_PORT` for host-side Prisma commands.

The app listens on a **hardcoded** `PORT = 9100` in `src/main.ts` (compose maps `${BACKEND_PORT}` → 9100), global prefix `api/v1`, Swagger at `/swagger`. CORS origins are a hardcoded whitelist in `main.ts`.

## Architecture

**Global response envelope.** `ResponseInterceptor` (APP_INTERCEPTOR) wraps every successful return in `{ message: 'Success', statusCode: 200, result: <returned value> }` — statusCode and message are hardcoded regardless of the actual HTTP status. `AllExceptionFilter` (APP_FILTER) mirrors the shape for errors: `{ message, statusCode, result: null }`, taking `message[0]` when class-validator returns an array. So services/controllers return raw data; never build the envelope yourself.

**Auth + permissions.** `@AuthClaims()` (`src/decorators/claims-auth.decorator.ts`) is the single composite decorator that applies `ApiBearerAuth()` + `UseGuards(JwtAuthGuard, PermissionsGuard)`; it's applied at the controller class level everywhere except `AuthController`. `JwtAuthGuard` verifies the Bearer token and sets `request.user = payload`, where the payload is `{ id, name }` signed in `AuthService.login`. `PermissionsGuard` reads the `@Permissions(...)` metadata and hits the DB on every request to load the user's permission codes through `users_roles` → `roles_permissions`; **it passes if the user has ANY one of the listed permissions**, and passes unconditionally when a handler has no `@Permissions` decorator (as in `VisitsController`).

The JWT secret `'yourSecretKey'` is hardcoded and duplicated in `src/configs/jwt.options.ts` and `src/guards/jwt-auth.guard.ts` — change both together. Access tokens are signed with `expiresIn: '1y'` in `login()`, overriding the module's 15m default; refresh tokens are 30d rows in `refresh_tokens`.

**Permission enum is defined twice** — `PermissionNameType` in `prisma/schema.prisma` (a Postgres enum) and in `src/constants/permissions/permission-name-type.enum.ts`. Adding a permission means editing both, migrating, and re-running `prisma/seed.ts` (which upserts every enum value and grants all of them to the `ADMIN` role).

**Module shape.** Each `src/modules/<x>/` has `<x>.controller.ts`, `<x>.service.ts`, `<x>.module.ts`, and `dto/{create,update,filter}-<x>.dto.ts`. Modules import `PrismaModule` (except `AuthModule`, which providers `PrismaService` directly). `products` and `services` each host two controller/service pairs (entity + category) in one module.

**Service convention.** Public `create` / `getListX` / `findOne` / `update`, then a `// Repository methods` section of `findById` / `findByCode` / `findAll` / `count`. Listing is always `Promise.all([findAll(filter), count(filter)])` fed into `makePaginationResponse(data, page, pageSize, total)` from `@n-utils`, returning `{ page, pageSize, totalPage, total, data }`. Filter DTOs extend `PaginationWithSearchParamsDto` (`@n-dtos`), whose constructor supplies the page/pageSize defaults from `COMMON_CONSTANT`. Validation errors surface via the global `ValidationPipe({ transform: true })`, so query DTOs need `@Transform(({value}) => Number(value))` on numeric fields.

**Domain model.** `Customer` → many `Visit`. A `Visit` denormalizes `creatorId`/`creatorName` from the JWT and carries `countByCustomer` (the customer's nth visit, computed from the last visit at create time). Each visit optionally links one `Prescription` (of `PrescriptionItem`s referencing products, with per-dose fields) and one `ServiceUsage` (of `ServiceUsageItem`s referencing services); both item types denormalize name/price at the time of the visit. `VisitsService.updateVisitInfo` is the one non-trivial write: a `$transaction` that upserts prescription + service usage (replacing all items via `deleteMany: {}` then `createMany`), then updates the visit with `totalAmount` = sum of the two totals.

**Schema conventions.** Every model carries `isActive` (soft delete), `createdAt`, `updatedAt`; columns are `@map`'d to snake_case and tables `@@map`'d to plural snake_case. Queries should filter `isActive: true`.

## Imports

`tsconfig.json` sets `baseUrl: ./src` with aliases `@n-constants`, `@n-decorators`, `@n-dtos`, `@n-filter-exceptions`, `@n-guards`, `@n-interceptors`, `@n-middlewares`, `@n-models`, `@n-utils`. Two aliases are dead: `@n-config` points at a nonexistent `config/index.ts` (the dir is `configs/`) and `@n-modules` at a nonexistent `modules/index.ts`.

Existing code mixes aliases with bare baseUrl-relative paths — `from 'prisma/prisma.service'` and `from 'utils'` both resolve under `src/`. Prefer the `@n-*` aliases in new code, but note `PrismaService` has no alias, so `'prisma/prisma.service'` is the established import (this resolves to `src/prisma/`, **not** the root `prisma/` schema directory).

## Known rough edges

- `CustomersService.findAll` builds a `$queryRaw` via `Prisma.raw` with the `search` term string-interpolated — a SQL injection hole. Any new raw query should use tagged-template parameters instead.
- `VisitsService.findAll`/`count` hardcode a today-only `createdAt` range, so the visits list can never return older visits.
- `UsersService` `connect`/`set` `UsersOnRoles` by `roleIds` as if they were join-row ids; passwords are stored as given (only the seed hashes with bcrypt) — `AuthService.validateUser` compares with `bcrypt.compare`, so users created via the API cannot log in.
- `tsconfig` has `strictNullChecks` and `noImplicitAny` off, and dev mode uses `--transpile-only`; run `yarn build` to actually type-check.
