import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationParamsDto } from 'dtos/pagination-params.dto';
import { Gender } from '@prisma/client';

export class FilterCustomerDto extends PaginationParamsDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  parentPhone?: string;

  @IsEnum(Gender)
  @IsOptional()
  @ApiProperty({ enum: Gender, required: false })
  gender?: Gender;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  parentName?: string;
}
