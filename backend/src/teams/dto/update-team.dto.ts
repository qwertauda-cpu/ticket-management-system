import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

