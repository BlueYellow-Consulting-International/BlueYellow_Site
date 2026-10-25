import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../infra/prisma.service';

import { JwtGuard } from './guards/jwt.guard';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/** Public shape of a user — never exposes the password hash. */
function toPublicUser(user: { id: string; email: string; role: string }) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

/** JWT payload shape issued at login. */
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /** Current session user resolved from a verified token, role fresh from the DB. */
  @Get('me')
  @UseGuards(JwtGuard)
  async me(@Request() request: { user: TokenPayload }) {
    const user = await this.prisma.user.findUnique({
      where: { id: request.user.userId },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    return {
      success: true,
      user: toPublicUser(user),
    };
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const email = body.email.trim().toLowerCase();
    const password = body.password.trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'User already exists',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'User created',
      user: toPublicUser(user),
    };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const email = body.email.trim().toLowerCase();
    const password = body.password.trim();

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid password',
      };
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      message: 'Login successful',
      token,
      user: toPublicUser(user),
    };
  }
}
