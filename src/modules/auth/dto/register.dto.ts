// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}