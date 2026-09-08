import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const corsConfig = config.get<string>('CORS_ORIGIN') ?? true;
  const corsOrigins = typeof corsConfig === 'string' ? corsConfig.split(',').map((o) => o.trim()) : corsConfig;
  app.enableCors({ origin: corsOrigins });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(config.get<string>('PORT') ?? 4000);
  await app.listen(port);

  new Logger('Bootstrap').log(`API listening on ${await app.getUrl()}`);
}

void bootstrap();
