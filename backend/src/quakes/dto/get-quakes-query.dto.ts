import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { QuakeRange, QuakeSort } from '../types/quake.types';

export class GetQuakesQueryDto {
  @IsOptional()
  @IsEnum(QuakeRange)
  range: QuakeRange = QuakeRange.Day;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-2)
  @Max(10)
  minMagnitude?: number;

  @IsOptional()
  @IsEnum(QuakeSort)
  sort: QuakeSort = QuakeSort.Time;
}
