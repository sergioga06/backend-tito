// src/modules/orders/dto/update-order-status.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../../common/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}