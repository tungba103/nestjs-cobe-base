import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Product Name' })
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ example: 1 })
  productCategoryId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Transform(({ value }) => Number(value))
  @ApiProperty({ example: 100000 })
  price: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Product description' })
  description?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  @ApiProperty({ required: false, example: ProductStatus.ACTIVE })
  status?: ProductStatus;
}
