// src/modules/orders/dto/create-order-from-qr.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderFromQrDto {
  @IsString()
  @IsNotEmpty()
  qrCode: string; // El código del QR escaneado

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  customerName?: string;
}
