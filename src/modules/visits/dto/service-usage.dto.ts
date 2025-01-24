import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ServiceUsageItemDto {
  @IsNumber()
  @ApiProperty({ example: 1 })
  serviceId: number;

  @IsString()
  @ApiProperty({ example: 'Service Name' })
  serviceName: string;

  @IsNumber()
  @ApiProperty({ example: 1 })
  quantity: number;

  @IsNumber()
  @ApiProperty({ example: 100000 })
  price: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, example: 0 })
  discount?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Usage instructions' })
  usageInstructions?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Doctor notes about the service' })
  doctorNotes?: string;
}

export class ServiceUsageDto {
  @IsNumber()
  @ApiProperty({ example: 100000 })
  totalAmount: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, example: 0 })
  totalDiscount?: number;

  @ValidateNested({ each: true })
  @Type(() => ServiceUsageItemDto)
  @ApiProperty({ type: [ServiceUsageItemDto] })
  serviceUsageItems: ServiceUsageItemDto[];
}
