import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { LeadInput, leadInputSchema } from '@consulting/shared';

/** Body type of POST /leads — validated by ZodLeadPipe against the shared schema. */
export type CreateLeadDto = LeadInput;

/** Translates the shared zod schema into a NestJS Bad Request response. */
@Injectable()
export class ZodLeadPipe implements PipeTransform<unknown, LeadInput> {
  transform(value: unknown): LeadInput {
    const result = leadInputSchema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Invalid lead payload',
        errors: result.error.flatten(),
      });
    }
    return result.data;
  }
}
