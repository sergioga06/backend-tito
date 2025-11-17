// src/modules/products/dto/create-product.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  preparationTime?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergens?: string[];

  @IsBoolean()
  @IsOptional()
  isVegetarian?: boolean;

  @IsBoolean()
  @IsOptional()
  isVegan?: boolean;

  @IsBoolean()
  @IsOptional()
  isGlutenFree?: boolean;
}
