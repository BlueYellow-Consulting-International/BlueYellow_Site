import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common'

import { JwtService } from '@nestjs/jwt'

import * as bcrypt from 'bcrypt'

import { PrismaService } from '../prisma/prisma.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Controller('auth')
export class AuthController {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Get('login')
  getLogin() {
    return {
      message: 'Login endpoint works 🚀',
    }
  }

  @Post('register')
  async register(
    @Body() body: RegisterDto,
  ) {

    const email =
      body.email.trim().toLowerCase()

    const password =
      body.password.trim()

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      })

    if (existingUser) {
      return {
        success: false,
        message: 'User already exists',
      }
    }

    const hashedPassword =
      await bcrypt.hash(password, 10)

    const user =
      await this.prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
        },
      })

    return {
      success: true,
      message: 'User created',
      user,
    }
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
  ) {

    const email =
      body.email.trim().toLowerCase()

    const password =
      body.password.trim()

    const user =
      await this.prisma.user.findFirst({
        where: {
          email,
        },
      })

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.passwordHash,
      )

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid password',
      }
    }

    const token =
      this.jwtService.sign({
        userId: user.id,
        email: user.email,
        role: (user as any).role,
      })

    return {
      success: true,
      message: 'Login successful',
      token,
      user,
    }
  }

}