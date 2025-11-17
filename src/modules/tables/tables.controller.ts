// src/modules/tables/tables.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  // Crear mesa - Solo ADMIN
  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createTableDto: CreateTableDto) {
    return await this.tablesService.create(createTableDto);
  }

  // Obtener todas las mesas - Todos los roles autenticados
  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    return await this.tablesService.findAll(include);
  }

  // Obtener estadísticas - Admin y Kitchen Manager
  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.KITCHEN_MANAGER)
  async getStatistics() {
    return await this.tablesService.getStatistics();
  }

  // Obtener mesas disponibles - Todos los roles
  @Get('available')
  async findAvailable() {
    return await this.tablesService.findAvailable();
  }

  // Obtener mesas ocupadas - Todos los roles
  @Get('occupied')
  async findOccupied() {
    return await this.tablesService.findOccupied();
  }

  // Obtener una mesa por ID - Todos los roles
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.tablesService.findOne(id);
  }

  // Obtener mesa por número - Todos los roles
  @Get('number/:number')
  async findByNumber(@Param('number') number: string) {
    return await this.tablesService.findByNumber(parseInt(number));
  }

  // Actualizar mesa - Solo ADMIN
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return await this.tablesService.update(id, updateTableDto);
  }

  // Actualizar estado de mesa - Admin y Waiter
  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTableStatusDto,
  ) {
    return await this.tablesService.updateStatus(id, updateStatusDto);
  }

  // Ocupar mesa - Admin y Waiter
  @Post(':id/occupy')
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  async occupyTable(@Param('id') id: string) {
    return await this.tablesService.occupyTable(id);
  }

  // Liberar mesa - Admin y Waiter
  @Post(':id/release')
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  async releaseTable(@Param('id') id: string) {
    return await this.tablesService.releaseTable(id);
  }

  // Desactivar mesa - Solo ADMIN
  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  async deactivate(@Param('id') id: string) {
    return await this.tablesService.deactivate(id);
  }

  // Activar mesa - Solo ADMIN
  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  async activate(@Param('id') id: string) {
    return await this.tablesService.activate(id);
  }

  // Eliminar mesa - Solo ADMIN
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.tablesService.remove(id);
    return { message: 'Mesa eliminada correctamente' };
  }
}