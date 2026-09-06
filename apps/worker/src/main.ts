import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { OutboxRunner } from './outbox.runner';
import { FLECTRA_PORT } from './flectra/flectra.port';
import { WorkerModule } from './worker.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Worker');
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();

  logger.log(`Flectra integration mode: ${app.get(FLECTRA_PORT).mode}`);

  await app.get(OutboxRunner).start();
  logger.log('Outbox worker running — Ctrl+C to stop');
}

void bootstrap();
