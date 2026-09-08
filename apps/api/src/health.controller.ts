import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './infra/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{ status: string; database: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({ status: 'degraded', database: 'down' });
    }
    return { status: 'ok', database: 'up' };
  }
}
