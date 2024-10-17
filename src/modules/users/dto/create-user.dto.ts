import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'username' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'name' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'https://www.example.com/image.jpg' })
  avatarUrl?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ example: [1] })
  roleIds?: number[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123456' })
  password: string;
}
