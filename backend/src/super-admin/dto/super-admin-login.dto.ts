import { IsString, MinLength } from 'class-validator';

export class SuperAdminLoginDto {
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

