import { Injectable } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ClientsService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async getAnalytics() {

    const totalClients =
      await this.prisma.client.count()

    return {
      totalClients,
      activeProjects: totalClients,
      monthlyRevenue:
        totalClients * 500,
    }
  }

}