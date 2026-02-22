import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Conference 2026' })
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Annual technology meetup' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-12-25T10:00:00.000Z' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creatorReminderDaysBefore?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
