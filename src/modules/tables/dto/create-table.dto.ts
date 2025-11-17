// src/modules/tables/dto/create-table.dto.ts
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { TableStatus } from '../../../common/enums/table-status.enum';

export class CreateTableDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  number: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  capacity?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;
}
