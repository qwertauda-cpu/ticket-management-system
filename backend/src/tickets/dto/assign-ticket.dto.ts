import { IsString, IsNotEmpty, IsIn, MaxLength } from 'class-validator';

export class AssignTicketDto {
  @IsString()
  @IsIn(['team', 'technician'])
  assigneeType!: 'team' | 'technician';

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  assigneeId!: string;
}

