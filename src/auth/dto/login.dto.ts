import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  emailOrPhone: string;
  @IsNotEmpty()
  password: string;
}
