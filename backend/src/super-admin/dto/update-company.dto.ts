import { IsString, IsOptional, IsBoolean, IsInt, IsDateString } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  subscriptionPlan?: string; // 'Basic', 'Pro', 'Enterprise'

  @IsOptional()
  @IsDateString()
  subscriptionStartDate?: string;

  @IsOptional()
  @IsDateString()
  subscriptionEndDate?: string;

  @IsOptional()
  @IsInt()
  maxUsers?: number;

  @IsOptional()
  @IsInt()
  maxTickets?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

