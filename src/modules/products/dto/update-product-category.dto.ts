import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductCategoryDto } from './create-product-category.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateProductCategoryDto extends PartialType(
  CreateProductCategoryDto,
) {
  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true })
  isActive?: boolean;
}
