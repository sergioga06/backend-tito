// src/modules/qr-codes/qr-codes.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { QrCode } from './entities/qr-code.entity';
import { Table } from '../tables/entities/table.entity';

@Injectable()
export class QrCodesService {
  constructor(
    @InjectRepository(QrCode)
    private readonly qrCodeRepository: Repository<QrCode>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    private readonly configService: ConfigService,
  ) {}

  // Generar QR para una mesa específica
  async generateQrForTable(tableId: string): Promise<QrCode> {
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
    });

    if (!table) {
      throw new NotFoundException('Mesa no encontrada');
    }

    // Verificar si ya existe un QR activo para esta mesa
    const existingQr = await this.qrCodeRepository.findOne({
      where: { table: { id: tableId } },
      relations: ['table'],
    });

    // Si existe y no está expirado, retornarlo
    if (existingQr && existingQr.isValid()) {
      return existingQr;
    }

    // Si existe pero está expirado, desactivarlo
    if (existingQr) {
      existingQr.isActive = false;
      await this.qrCodeRepository.save(existingQr);
    }

    // Generar nuevo código único
    const code = uuidv4();
    const qrBaseUrl = this.configService.get<string>('QR_BASE_URL');
    const qrUrl = `${qrBaseUrl}/${code}`;

    // Generar imagen QR en base64
    const qrImageBase64 = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
    });

    // Calcular fecha de expiración (fin del mes actual)
    const expirationDate = this.getEndOfMonth();

    // Crear y guardar QR
    const qrCode = this.qrCodeRepository.create({
      table,
      code,
      qrImageBase64,
      expirationDate,
      isActive: true,
    });

    return await this.qrCodeRepository.save(qrCode);
  }

  // Generar QRs para todas las mesas
  async generateQrForAllTables(): Promise<QrCode[]> {
    const tables = await this.tableRepository.find({
      where: { isActive: true },
    });

    const qrCodes: QrCode[] = [];

    for (const table of tables) {
      const qrCode = await this.generateQrForTable(table.id);
      qrCodes.push(qrCode);
    }

    return qrCodes;
  }

  // Validar un código QR
  async validateQrCode(code: string): Promise<QrCode> {
    const qrCode = await this.qrCodeRepository.findOne({
      where: { code },
      relations: ['table'],
    });

    if (!qrCode) {
      throw new NotFoundException('Código QR no encontrado');
    }

    if (!qrCode.isValid()) {
      throw new BadRequestException('Código QR expirado o inactivo');
    }

    return qrCode;
  }

  // Obtener QR de una mesa
  async getQrByTable(tableId: string): Promise<QrCode> {
    const qrCode = await this.qrCodeRepository.findOne({
      where: { table: { id: tableId } },
      relations: ['table'],
    });

    if (!qrCode) {
      throw new NotFoundException('No hay código QR para esta mesa');
    }

    return qrCode;
  }

  // Listar todos los QRs activos
  async findAll(): Promise<QrCode[]> {
    return await this.qrCodeRepository.find({
      where: { isActive: true },
      relations: ['table'],
      order: { createdAt: 'DESC' },
    });
  }

  // Renovar todos los QRs (ejecutar mensualmente)
  async renewAllQrs(): Promise<QrCode[]> {
    // Desactivar todos los QRs actuales
    await this.qrCodeRepository.update({ isActive: true }, { isActive: false });

    // Generar nuevos QRs para todas las mesas
    return await this.generateQrForAllTables();
  }

  // Desactivar QR de una mesa
  async deactivateQr(tableId: string): Promise<void> {
    const qrCode = await this.getQrByTable(tableId);
    qrCode.isActive = false;
    await this.qrCodeRepository.save(qrCode);
  }

  // Método auxiliar para obtener el final del mes
  private getEndOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }
}