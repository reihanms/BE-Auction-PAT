import {
  Controller,
  Get,
  Req,
  Res,
  Post,
  UseGuards,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TransformPasswordPipe } from './strategies/transform-password.pipe';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    return await this.authService.login(dto, res);
  }

  @UsePipes(ValidationPipe, TransformPasswordPipe)
  @HttpCode(200)
  @Post('signup')
  async signup(@Body() dto: RegisterDto) {
    return await this.authService.signup(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
