import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateLeadResponse, SyncStatusResponse } from '@consulting/shared';
import { LeadsService } from './leads.service';
import { CreateLeadDto, ZodLeadPipe } from './create-lead.dto';
import { UpdateLeadDto, ZodUpdateLeadPipe } from './update-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /** Public endpoint used by the website contact form. */
  @Post()
  async create(
    @Body(new ZodLeadPipe()) input: CreateLeadDto,
  ): Promise<CreateLeadResponse> {
    const lead = await this.leadsService.create(input);
    return { id: lead.id, status: lead.status };
  }

  @Get()
  async findAll() {
    return this.leadsService.findAll();
  }

  /** POC verification: how far did this lead get in the sync pipeline? */
  @Post(':id/archive')
  async archive(@Param('id') id: string) {
    return this.leadsService.archive(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body(new ZodUpdateLeadPipe()) input: UpdateLeadDto) {
    return this.leadsService.update(id, input);
  }

  @Get(':id')
  async getSyncStatus(@Param('id') id: string): Promise<SyncStatusResponse> {
    return this.leadsService.getSyncStatus(id);
  }
}






