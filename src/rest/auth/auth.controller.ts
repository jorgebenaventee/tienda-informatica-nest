import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthService, User } from './auth.service'
import { SignInDto } from './dto/signInDto'
import { Request } from 'express'
import { CreateClientDto } from '../clients/dto/create-client.dto'
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard'

interface CustomRequest extends Request {
  user: User
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto)
  }

  @Post('sign-up')
  async signUp(@Body() signUpDto: CreateClientDto) {
    if (Object.keys(signUpDto).length === 0) {
      throw new BadRequestException('Cannot create an empty client')
    }
    return await this.authService.signUp(signUpDto)
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: CustomRequest) {
    return this.authService.getProfile(req)
  }
}
