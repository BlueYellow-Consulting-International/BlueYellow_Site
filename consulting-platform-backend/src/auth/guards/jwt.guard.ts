import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request =
      context.switchToHttp().getRequest()

    const authHeader =
      request.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedException(
        'Token missing',
      )
    }

    const token =
      authHeader.split(' ')[1]

    if (!token) {
      throw new UnauthorizedException(
        'Invalid token',
      )
    }

    try {

      const payload =
        await this.jwtService.verifyAsync(
          token,
        )

      request.user = payload

      return true

    } catch {

      throw new UnauthorizedException(
        'Token invalid',
      )
    }
  }
}