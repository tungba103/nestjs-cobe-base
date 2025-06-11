# NestJS Code Base

This is a NestJS-based backend application with Docker support, PostgreSQL database, and various development tools.
## Step by step
1. Init database in docker
2. Init nestjs project
3. Init database models for authentication & authorization: users, roles, permissions, etc.
4. Init authentication & authorization.
=> After this step, expect result: Sign in successfully.

## Features

- User Management
- Role-based Authorization
- JWT Authentication
- RESTful API with Swagger Documentation

# Key features
- Search keywords, scan social and show suggestions food places.

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- npm or yarn

## Getting Started

### Development with Docker

1. Initialize the development environment:
```bash
make init-dev
```
This command will build and start all necessary Docker containers in detached mode.

2. Connect to the backend container + start the application:
```bash
make connect

# Generate Prisma client (Run first time only)
npx prisma generate
npx prisma migrate deploy

# Start the application
yarn start:dev
```
This will open a bash shell inside the NestJS backend container.

3. Connect to the database:
```bash
make db-connect
```
This will connect to the PostgreSQL database using psql.

5. To stop and remove all containers and volumes:
```bash
make remove
```

### Available npm Scripts

- `npm run build` - Build the application
- `npm run format` - Format code using Prettier
- `npm run start` - Start the application
- `npm run start:dev` - Start the application in development mode with hot-reload
- `npm run start:debug` - Start the application in debug mode
- `npm run start:prod` - Start the production build

## Database

The project uses PostgreSQL with Prisma as the ORM. Database seeding is available through:
```bash
npx prisma db seed
```

## Testing

## Contributing