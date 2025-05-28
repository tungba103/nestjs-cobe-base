import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateServiceCategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Category Name' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Category description' })
  description?: string;
}
