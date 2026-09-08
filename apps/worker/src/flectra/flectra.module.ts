import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FlectraClient } from '@consulting/flectra';
import { FLECTRA_PORT, FlectraPort } from './flectra.port';
import { NoopFlectraAdapter } from './noop-flectra.adapter';
import { RealFlectraAdapter } from './real-flectra.adapter';

export const flectraPortProvider: Provider = {
  provide: FLECTRA_PORT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): FlectraPort => {
    if ((config.get<string>('FLECTRA_ENABLED') ?? 'false') === 'true') {
      return new RealFlectraAdapter(
        new FlectraClient({
          baseUrl: config.getOrThrow<string>('FLECTRA_URL'),
          db: config.getOrThrow<string>('FLECTRA_DB'),
          user: config.getOrThrow<string>('FLECTRA_USER'),
          apiKey: config.getOrThrow<string>('FLECTRA_API_KEY'),
        }),
      );
    }
    return new NoopFlectraAdapter();
  },
};

@Module({
  providers: [flectraPortProvider],
  exports: [flectraPortProvider],
})
export class FlectraModule {}
