import {
  Controller,
  Get,
  Res,
  Post,
  UseGuards,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  Request,
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TransformPasswordPipe } from './strategies/transform-password.pipe';
import { EditProfileDto } from './dto/edit-profile.dto';

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
  async getProfile(@Request() req: any) {
    const userId = req.user.user_id;
    return await this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  @Put('profile')
  async editProfile(@Request() req: any, @Body() dto: EditProfileDto) {
    const userId = req.user.user_id;
    return await this.authService.editProfile(userId, dto);
  }
}
