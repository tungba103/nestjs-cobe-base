import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateServiceCategoryDto } from './create-service-category.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateServiceCategoryDto extends PartialType(
  CreateServiceCategoryDto,
) {
  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true })
  isActive?: boolean;
}
