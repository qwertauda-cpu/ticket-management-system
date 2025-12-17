import { IsDateString, IsOptional } from 'class-validator';

export class TicketsSummaryQueryDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}


