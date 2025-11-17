// src/modules/qr-codes/qr-codes.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { QrCodesService } from './qr-codes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  // Endpoint público para validar QR (usado por el frontend del cliente)
  @Get('validate/:code')
  async validateQr(@Param('code') code: string) {
    const qrCode = await this.qrCodesService.validateQrCode(code);
    return {
      valid: true,
      table: qrCode.table,
      expirationDate: qrCode.expirationDate,
    };
  }

  // Solo ADMIN puede generar QRs
  @Post('generate/table/:tableId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async generateForTable(@Param('tableId') tableId: string) {
    return await this.qrCodesService.generateQrForTable(tableId);
  }

  @Post('generate/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async generateForAllTables() {
    return await this.qrCodesService.generateQrForAllTables();
  }

  @Post('renew/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async renewAllQrs() {
    return await this.qrCodesService.renewAllQrs();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return await this.qrCodesService.findAll();
  }

  @Get('table/:tableId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getByTable(@Param('tableId') tableId: string) {
    return await this.qrCodesService.getQrByTable(tableId);
  }

  @Delete('table/:tableId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deactivateQr(@Param('tableId') tableId: string) {
    await this.qrCodesService.deactivateQr(tableId);
    return { message: 'QR desactivado correctamente' };
  }
}