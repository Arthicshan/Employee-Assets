import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ProblemDetailsFilter } from '../src/common/filters/problem-details.filter';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new ProblemDetailsFilter());

  await app.init();
  return app;
}

export async function getAuthToken(
  app: INestApplication,
  email = 'admin@assetflow.com',
  password = 'admin123',
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const req = require('supertest');
  const res = await req(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });
  return res.body?.accessToken || res.body?.token;
}


