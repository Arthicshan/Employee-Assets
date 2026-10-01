import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ProblemDetailsFilter } from './common/filters/problem-details.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Problem Details exception filter (RFC 7807)
  app.useGlobalFilters(new ProblemDetailsFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
}

void bootstrap();