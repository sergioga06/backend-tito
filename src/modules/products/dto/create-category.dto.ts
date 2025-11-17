// src/modules/products/dto/create-category.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;
}