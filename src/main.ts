import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { blue, red } from 'colorette';

const PORT = 9100;
const GLOBAL_PREFIX = 'api/v1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.setGlobalPrefix(GLOBAL_PREFIX);
  setupOpenApi(app);

  await app.listen(PORT);
  console.log(
    `${blue(`Application is running on:`)} ${red(`http://localhost:${PORT}/${GLOBAL_PREFIX}`)}`,
  );

  console.log(
    `${blue(`Application swagger is running on:`)} ${red(`http://localhost:${PORT}/swagger`)}`,
  );
}

function setupOpenApi(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Code base API')
    .setDescription('NestJS application for Code base Backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('swagger', app, document);
}

bootstrap();
