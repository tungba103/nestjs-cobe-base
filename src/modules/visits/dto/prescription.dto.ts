import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PrescriptionItemDto {
  @IsNumber()
  @ApiProperty({ example: 1 })
  productId: number;

  @IsString()
  @ApiProperty({ example: 'Product Name' })
  productName: string;

  @IsNumber()
  @ApiProperty({ example: 2 })
  quantity: number;

  @IsNumber()
  @ApiProperty({ example: 100000 })
  price: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, example: 0 })
  discount?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, example: 1 })
  morningDosage?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, example: 1 })
  noonDosage?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, example: 1 })
  afternoonDosage?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, example: 1 })
  eveningDosage?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Take with meals' })
  usageInstructions?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'Doctor notes about the prescription',
  })
  doctorNotes?: string;
}

export class PrescriptionDto {
  @IsNumber()
  @ApiProperty({ example: 100000 })
  totalAmount: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, example: 0 })
  totalDiscount?: number;

  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  @ApiProperty({ type: [PrescriptionItemDto] })
  prescriptionItems: PrescriptionItemDto[];
}
