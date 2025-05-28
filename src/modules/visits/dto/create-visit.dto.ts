import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateVisitDto {
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @ApiProperty({ example: 1 })
  customerId: number;
}
