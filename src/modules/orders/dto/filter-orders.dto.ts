// src/modules/orders/dto/filter-orders.dto.ts
import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { OrderSource } from '../../../common/enums/order-source.enum';

export class FilterOrdersDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(OrderSource)
  @IsOptional()
  source?: OrderSource;

  @IsUUID()
  @IsOptional()
  tableId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}