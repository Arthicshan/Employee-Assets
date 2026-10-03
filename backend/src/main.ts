import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ProblemDetailsFilter } from './common/filters/problem-details.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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

  // Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Employee Asset & Inventory Management API')
    .setDescription(
      'Enterprise AssetFlow REST API documentation for hardware inventory, employee allocations, lifecycle auditing, returns, and authentication.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token obtained from /auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health', 'System and database health monitoring')
    .addTag('Auth', 'User authentication and profile')
    .addTag('Assets', 'Hardware and equipment inventory lifecycle')
    .addTag('Categories', 'Asset categorization management')
    .addTag('Employees', 'Staff directory and asset holder records')
    .addTag('Assignments', 'Equipment assignment and custody tracking')
    .addTag('Returns', 'Equipment return processing and condition inspection')
    .addTag('Asset History', 'Immutable audit logs and custody transitions')
    .addTag('Dashboard', 'Real-time metrics, counters, and statistics')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'AssetFlow API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

void bootstrap();