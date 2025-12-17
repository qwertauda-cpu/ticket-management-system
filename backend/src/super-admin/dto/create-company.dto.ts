import { IsEmail, IsString, IsOptional, IsNumber, IsDateString, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @MinLength(2)
  companyName: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(6)
  adminPassword: string;

  @IsString()
  adminName: string;

  @IsString()
  @IsOptional()
  subscriptionPlan?: string;

  @IsDateString()
  @IsOptional()
  subscriptionStartDate?: string;

  @IsDateString()
  @IsOptional()
  subscriptionEndDate?: string;

  @IsNumber()
  @IsOptional()
  maxUsers?: number;

  @IsNumber()
  @IsOptional()
  maxTickets?: number;

  @IsNumber()
  @IsOptional()
  pricePerUser?: number; // دينار عراقي لكل موظف
}

