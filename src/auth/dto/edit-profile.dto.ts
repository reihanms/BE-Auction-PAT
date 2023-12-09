import { IsOptional } from 'class-validator';

export class EditProfileDto {
  @IsOptional()
  profile_picture: string;
  @IsOptional()
  name: string;
  @IsOptional()
  email: string;
  @IsOptional()
  phone_number: string;
  @IsOptional()
  address: string;
}
