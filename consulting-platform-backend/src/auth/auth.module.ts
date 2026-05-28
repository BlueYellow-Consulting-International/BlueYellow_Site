import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from './auth.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [
    PrismaModule,

    JwtModule.register({
      secret: 'super-secret-key',
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],

  controllers: [AuthController],
})
export class AuthModule {}