import { PaginationWithSearchParamsDto } from '@n-dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class FilterVisitDto extends PaginationWithSearchParamsDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ required: false, example: 1 })
  customerId?: number;

  constructor() {
    super();
  }
}
