import { IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  phone_number: string;
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  password: string;
}
