import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'

import { JwtGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'

import { Roles } from '../auth/decorators/roles.decorator'

import { ClientsService } from './clients.service'

import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'

@UseGuards(JwtGuard)
@Controller('clients')
export class ClientsController {

  constructor(
    private prisma: PrismaService,
    private clientsService: ClientsService,
  ) {}

  @Get('analytics')
  async getAnalytics() {

    return this.clientsService.getAnalytics()

  }

  @Get()
  async getClients() {

    return this.prisma.client.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post()
  async createClient(
    @Body() body: CreateClientDto,
  ) {

    const { name, service } = body

    const client = await this.prisma.client.create({
      data: {
        name,
        service,
      },
    })

    return client
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Patch(':id')
  async updateClient(
    @Param('id') id: string,
    @Body() body: UpdateClientDto,
  ) {

    const { name, service } = body

    const updatedClient =
      await this.prisma.client.update({
        where: {
          id,
        },
        data: {
          name,
          service,
        },
      })

    return updatedClient
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async deleteClient(
    @Param('id') id: string,
  ) {

    await this.prisma.client.delete({
      where: {
        id,
      },
    })

    return {
      success: true,
      message: 'Client deleted',
    }
  }

}