import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

function toStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.map(String).filter((v) => v.length > 0);
  const s = String(value).trim();
  if (!s) return undefined;
  // Support comma-separated single param: status=OPEN,ASSIGNED
  if (s.includes(',')) return s.split(',').map((x) => x.trim()).filter(Boolean);
  return [s];
}

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase().trim();
  if (s === 'true' || s === '1') return true;
  if (s === 'false' || s === '0') return false;
  return undefined;
}

function toInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : undefined;
}

export class ListTicketsQueryDto {
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsIn(['OPEN', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'WAITING', 'ON_HOLD', 'DONE'], {
    each: true,
  })
  status?: string[];

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  nationalSla?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  priority?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  zone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ticketType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  teamId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  technicianId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  q?: string;

  @IsOptional()
  @Transform(({ value }) => toInt(value) ?? 1)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => toInt(value) ?? 20)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;
}


