// src/modules/orders/dto/create-order.dto.ts
import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderSource } from '../../../common/enums/order-source.enum';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  tableId: string;

  @IsEnum(OrderSource)
  @IsNotEmpty()
  source: OrderSource;

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