import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { jwtConstants } from './constants';
import { omit } from 'lodash';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare } from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
@Injectable()
export class AuthService {
  constructor(
    private dbService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: RegisterDto) {
    const usernameExist = await this.dbService.users.findFirst({
      where: {
        username: dto.username,
      },
    });
    const phoneNumberExist = await this.dbService.users.findFirst({
      where: {
        phone_number: dto.phone_number,
      },
    });

    if (usernameExist) {
      throw new HttpException('Username already used', HttpStatus.BAD_REQUEST);
    }
    if (phoneNumberExist) {
      throw new HttpException(
        'Phone number already used',
        HttpStatus.BAD_REQUEST,
      );
    }

    const createUser = await this.dbService.users.create({
      data: dto,
    });
    if (createUser) {
      return {
        statusCode: 200,
        message: 'Register success',
        data: omit(createUser, ['password', 'created_at', 'updated_at']),
      };
    }
  }
  async login(dto: LoginDto, res: Response) {
    const user = await this.dbService.users.findFirst({
      where: {
        OR: [
          { username: dto.usernameOrPhone },
          { phone_number: dto.usernameOrPhone },
        ],
      },
    });
    if (!user) {
      throw new HttpException('Akun Belum Terdaftar!', HttpStatus.NOT_FOUND);
    }

    const checkPassword = await compare(dto.password, user.password);
    if (!checkPassword) {
      throw new HttpException(
        'Email or password wrong!',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.generateJwt(
      res,
      user,
      user.id,
      user.username,
      user.name,
      jwtConstants.secret,
      jwtConstants.expired,
    );
  }
  async generateJwt(
    res: Response,
    user: any,
    userId: any,
    username: string,
    name: any,
    secret = jwtConstants.secret,
    expired = jwtConstants.expired,
  ) {
    const token = await this.jwtService.sign(
      {
        sub: userId,
        username: username,
        name: name,
      },
      {
        expiresIn: expired,
        secret,
      },
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
    });
    return {
      statusCode: 200,
      user: omit(user, ['password', 'created_at', 'updated_at']),
    };
  }
}
