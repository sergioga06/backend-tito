// src/modules/tables/dto/update-table.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTableDto } from './create-table.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTableDto extends PartialType(CreateTableDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}