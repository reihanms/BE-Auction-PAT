import { IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  phone_number: string;
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}
