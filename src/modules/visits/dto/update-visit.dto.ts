import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { VisitStatus } from '@prisma/client';
import { PrescriptionDto } from './prescription.dto';
import { ServiceUsageDto } from './service-usage.dto';

export class UpdateVisitDto {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ required: false, example: 100000 })
  totalAmount?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ required: false, example: 100000 })
  totalDiscount?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Patient diagnosis details' })
  diagnosis?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Patient symptoms' })
  symptoms?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Personal medical history details' })
  personalMedicalHistory?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Family medical history details' })
  familyMedicalHistory?: string;

  @ValidateNested()
  @Type(() => PrescriptionDto)
  @IsOptional()
  @ApiProperty({ required: false, type: PrescriptionDto })
  prescription?: PrescriptionDto;

  @ValidateNested()
  @Type(() => ServiceUsageDto)
  @IsOptional()
  @ApiProperty({ required: false, type: ServiceUsageDto })
  serviceUsage?: ServiceUsageDto;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @ApiProperty({ required: false, example: '2024-01-25T10:00:00Z' })
  reExaminationTime?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: "Doctor's advice for the patient" })
  advice?: string;

  @IsEnum(VisitStatus)
  @IsOptional()
  @ApiProperty({
    required: false,
    enum: VisitStatus,
    example: VisitStatus.IN_PROGRESS,
  })
  status?: VisitStatus;
}
