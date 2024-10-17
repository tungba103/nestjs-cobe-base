import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true })
  isActive: boolean;
}
