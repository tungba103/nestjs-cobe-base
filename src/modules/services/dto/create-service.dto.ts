import { ApiProperty } from '@nestjs/swagger';
import { ServiceStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Service Name' })
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ example: 1 })
  serviceCategoryId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Transform(({ value }) => Number(value))
  @ApiProperty({ example: 100000 })
  price: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Service description' })
  description?: string;

  @IsEnum(ServiceStatus)
  @IsOptional()
  @ApiProperty({ required: false, example: ServiceStatus.ACTIVE })
  status?: ServiceStatus;
}
