// src/modules/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderFromQrDto } from './dto/create-order-from-qr.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ========== ENDPOINTS PÚBLICOS ==========

  // Crear pedido desde QR (sin autenticación)
  @Post('from-qr')
  async createFromQr(@Body() createOrderFromQrDto: CreateOrderFromQrDto) {
    return await this.ordersService.createOrderFromQr(createOrderFromQrDto);
  }

  // Consultar estado de pedido (público, para clientes)
  @Get('track/:orderNumber')
  async trackOrder(@Param('orderNumber') orderNumber: string) {
    const order = await this.ordersService.findByOrderNumber(orderNumber);
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedTime: order.estimatedTime,
      table: {
        number: order.table.number,
        name: order.table.name,
      },
      items: order.items.map((item) => ({
        product: item.product.name,
        quantity: item.quantity,
      })),
      total: order.total,
      createdAt: order.createdAt,
    };
  }

  // ========== ENDPOINTS PROTEGIDOS ==========

  // Crear pedido (Camarero/Admin)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User,
  ) {
    return await this.ordersService.createOrder(createOrderDto, user);
  }

  // Obtener todos los pedidos con filtros
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() filterDto: FilterOrdersDto) {
    return await this.ordersService.findAll(filterDto);
  }

  // Obtener dashboard
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KITCHEN_MANAGER)
  async getDashboard() {
    return await this.ordersService.getDashboard();
  }

  // Obtener estadísticas
  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KITCHEN_MANAGER)
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.ordersService.getStatistics(start, end);
  }

  // Obtener pedidos activos
  @Get('active')
  @UseGuards(JwtAuthGuard)
  async findActive() {
    return await this.ordersService.findActiveOrders();
  }

  // Obtener pedidos de hoy
  @Get('today')
  @UseGuards(JwtAuthGuard)
  async findToday() {
    return await this.ordersService.findTodayOrders();
  }

  // Obtener productos más vendidos
  @Get('best-selling')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KITCHEN_MANAGER)
  async getBestSelling(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return await this.ordersService.getBestSellingProducts(limitNum);
  }

  // Obtener ventas por día
  @Get('sales-by-day')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KITCHEN_MANAGER)
  async getSalesByDay(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days) : 7;
    return await this.ordersService.getSalesByDay(daysNum);
  }

  // Obtener pedidos por fuente
  @Get('by-source')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getOrdersBySource() {
    return await this.ordersService.getOrdersBySource();
  }

  // Obtener un pedido específico
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  // Obtener pedidos de una mesa
  @Get('table/:tableId')
  @UseGuards(JwtAuthGuard)
  async findByTable(@Param('tableId') tableId: string) {
    return await this.ordersService.findOrdersByTable(tableId);
  }

  // Actualizar estado del pedido
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return await this.ordersService.updateStatus(id, updateStatusDto);
  }

  // Confirmar pedido (Admin/Camarero)
  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  async confirm(@Param('id') id: string) {
    return await this.ordersService.confirmOrder(id);
  }

  // Iniciar preparación (Cocina)
  @Post(':id/start-preparing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KITCHEN_MANAGER)
  async startPreparing(@Param('id') id: string) {
    return await this.ordersService.startPreparing(id);
  }

  // Marcar como listo (Cocina)
  @Post(':id/ready')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KITCHEN_MANAGER)
  async markAsReady(@Param('id') id: string) {
    return await this.ordersService.markAsReady(id);
  }

  // Marcar como entregado (Camarero)
  @Post(':id/delivered')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  async markAsDelivered(@Param('id') id: string) {
    return await this.ordersService.markAsDelivered(id);
  }

  // Cancelar pedido
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return await this.ordersService.cancelOrder(id, reason);
  }
}