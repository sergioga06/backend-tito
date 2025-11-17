// src/modules/orders/dto/create-order-item.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min, IsOptional } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}