// src/modules/tables/tables.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { TableStatus } from '../../common/enums/table-status.enum';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  // Crear nueva mesa
  async create(createTableDto: CreateTableDto): Promise<Table> {
    const { number } = createTableDto;

    // Verificar si ya existe una mesa con ese número
    const existingTable = await this.tableRepository.findOne({
      where: { number },
    });

    if (existingTable) {
      throw new ConflictException(
        `Ya existe una mesa con el número ${number}`,
      );
    }

    const table = this.tableRepository.create(createTableDto);
    return await this.tableRepository.save(table);
  }

  // Obtener todas las mesas
  async findAll(includeInactive = false): Promise<Table[]> {
    const where = includeInactive ? {} : { isActive: true };

    return await this.tableRepository.find({
      where,
      relations: ['qrCode', 'orders'],
      order: { number: 'ASC' },
    });
  }

  // Obtener mesas por estado
  async findByStatus(status: TableStatus): Promise<Table[]> {
    return await this.tableRepository.find({
      where: { status, isActive: true },
      relations: ['qrCode'],
      order: { number: 'ASC' },
    });
  }

  // Obtener mesas disponibles
  async findAvailable(): Promise<Table[]> {
    return await this.findByStatus(TableStatus.AVAILABLE);
  }

  // Obtener mesas ocupadas
  async findOccupied(): Promise<Table[]> {
    return await this.findByStatus(TableStatus.OCCUPIED);
  }

  // Obtener una mesa por ID
  async findOne(id: string): Promise<Table> {
    const table = await this.tableRepository.findOne({
      where: { id },
      relations: ['qrCode', 'orders'],
    });

    if (!table) {
      throw new NotFoundException('Mesa no encontrada');
    }

    return table;
  }

  // Obtener una mesa por número
  async findByNumber(number: number): Promise<Table> {
    const table = await this.tableRepository.findOne({
      where: { number },
      relations: ['qrCode'],
    });

    if (!table) {
      throw new NotFoundException(`Mesa número ${number} no encontrada`);
    }

    return table;
  }

  // Actualizar mesa
  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    const table = await this.findOne(id);

    // Si se está cambiando el número, verificar que no exista
    if (updateTableDto.number && updateTableDto.number !== table.number) {
      const existingTable = await this.tableRepository.findOne({
        where: { number: updateTableDto.number },
      });

      if (existingTable) {
        throw new ConflictException(
          `Ya existe una mesa con el número ${updateTableDto.number}`,
        );
      }
    }

    Object.assign(table, updateTableDto);
    return await this.tableRepository.save(table);
  }

  // Actualizar estado de la mesa
  async updateStatus(
    id: string,
    updateStatusDto: UpdateTableStatusDto,
  ): Promise<Table> {
    const table = await this.findOne(id);
    table.status = updateStatusDto.status;
    return await this.tableRepository.save(table);
  }

  // Ocupar mesa (cuando llega un pedido)
  async occupyTable(id: string): Promise<Table> {
    return await this.updateStatus(id, { status: TableStatus.OCCUPIED });
  }

  // Liberar mesa (cuando se completa el pedido)
  async releaseTable(id: string): Promise<Table> {
    return await this.updateStatus(id, { status: TableStatus.AVAILABLE });
  }

  // Desactivar mesa (soft delete)
  async deactivate(id: string): Promise<Table> {
    const table = await this.findOne(id);
    table.isActive = false;
    return await this.tableRepository.save(table);
  }

  // Activar mesa
  async activate(id: string): Promise<Table> {
    const table = await this.tableRepository.findOne({ where: { id } });

    if (!table) {
      throw new NotFoundException('Mesa no encontrada');
    }

    table.isActive = true;
    return await this.tableRepository.save(table);
  }

  // Eliminar mesa (hard delete)
  async remove(id: string): Promise<void> {
    const table = await this.findOne(id);
    await this.tableRepository.remove(table);
  }

  // Obtener estadísticas de mesas
  async getStatistics() {
    const total = await this.tableRepository.count({
      where: { isActive: true },
    });

    const available = await this.tableRepository.count({
      where: { isActive: true, status: TableStatus.AVAILABLE },
    });

    const occupied = await this.tableRepository.count({
      where: { isActive: true, status: TableStatus.OCCUPIED },
    });

    const reserved = await this.tableRepository.count({
      where: { isActive: true, status: TableStatus.RESERVED },
    });

    return {
      total,
      available,
      occupied,
      reserved,
      occupancyRate: total > 0 ? ((occupied / total) * 100).toFixed(2) : 0,
    };
  }
}