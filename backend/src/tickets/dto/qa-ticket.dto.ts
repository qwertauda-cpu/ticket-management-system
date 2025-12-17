import { IsString, IsOptional, MaxLength } from 'class-validator';

export class QaTicketDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  qaNotes?: string;
}

