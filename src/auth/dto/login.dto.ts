import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  usernameOrPhone: string;
  @IsNotEmpty()
  password: string;
}
