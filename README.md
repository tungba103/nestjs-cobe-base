# NestJS Code Base

This is a NestJS-based backend application with Docker support, PostgreSQL database, and various development tools.

## Features

- User Management
- Role-based Authorization
- JWT Authentication
- RESTful API with Swagger Documentation

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

2. Connect to the backend container:
```bash
make connect
```
This will open a bash shell inside the NestJS backend container.

3. Connect to the database:
```bash
make db-connect
```
This will connect to the PostgreSQL database using psql.

4. To stop and remove all containers and volumes:
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
- `npm run lint` - Lint the codebase
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:debug` - Debug tests
- `npm run test:e2e` - Run end-to-end tests

## Project Structure

The project uses:
- NestJS 10.x
- PostgreSQL with Prisma ORM
- JWT Authentication with Passport
- Swagger for API documentation
- Winston for logging
- Jest for testing

## Development

The project is configured with:
- TypeScript
- ESLint and Prettier for code formatting
- Nodemon for development
- Jest for testing
- Prisma for database management

## Database

The project uses PostgreSQL with Prisma as the ORM. Database seeding is available through:
```bash
npx prisma db seed
```

## Testing

The project includes both unit tests and e2e tests:
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Coverage report: `npm run test:cov`

## Contributing

1. Ensure your code follows the project's coding standards
2. Run tests before submitting changes
3. Format your code using `npm run format`
4. Run linting using `npm run lint`
