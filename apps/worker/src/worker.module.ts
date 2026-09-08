import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from './prisma.token';
import { FlectraModule } from './flectra/flectra.module';
import { OutboxHandler } from './outbox.handler';
import { OutboxRunner } from './outbox.runner';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), FlectraModule],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: () => new PrismaClient() },
    OutboxHandler,
    OutboxRunner,
  ],
  exports: [PRISMA_CLIENT],
})
export class WorkerModule {}
