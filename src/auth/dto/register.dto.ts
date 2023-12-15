import { IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  phone_number: string;
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  address: string;
  @IsNotEmpty()
  password: string;
}
