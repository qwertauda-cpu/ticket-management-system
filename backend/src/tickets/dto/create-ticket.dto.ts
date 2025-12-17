import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  ticketType!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  subscriberName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  zone!: string;

  @ValidateIf((o) => o.ticketType === 'أخرى (مخصص)')
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  customIssue?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @IsBoolean()
  isNationalSla!: boolean;

  @IsString()
  @IsIn(['schedule', 'assign'])
  action!: 'schedule' | 'assign';

  @ValidateIf((o) => o.action === 'schedule')
  @IsDateString()
  scheduledAt?: string;

  @ValidateIf((o) => o.action === 'assign')
  @IsString()
  @IsIn(['team', 'technician'])
  assigneeType?: 'team' | 'technician';

  @ValidateIf((o) => o.action === 'assign')
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  assigneeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  temporaryTicketNumber?: string;
}


