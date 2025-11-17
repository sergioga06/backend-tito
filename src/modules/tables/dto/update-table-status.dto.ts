// src/modules/tables/dto/update-table-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TableStatus } from '../../../common/enums/table-status.enum';

export class UpdateTableStatusDto {
  @IsEnum(TableStatus)
  @IsNotEmpty()
  status: TableStatus;
}