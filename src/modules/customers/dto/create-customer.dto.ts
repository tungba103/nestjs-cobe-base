import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsEnum(Gender)
  @IsOptional()
  @ApiProperty({ enum: Gender, required: false })
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  @ApiProperty({ required: false, example: '2024-01-01' })
  birthDate?: Date;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Parent Name' })
  parentName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1234567890' })
  parentPhone: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: '123 Main St' })
  address?: string;
}
