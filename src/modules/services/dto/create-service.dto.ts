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

  @IsEnum(ServiceStatus)
  @IsOptional()
  @ApiProperty({ enum: ServiceStatus, required: false })
  status?: ServiceStatus;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Service description' })
  description?: string;
}
