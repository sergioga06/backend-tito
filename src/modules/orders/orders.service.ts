// src/modules/orders/orders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderFromQrDto } from './dto/create-order-from-qr.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { OrderSource } from '../../common/enums/order-source.enum';
import { TablesService } from '../tables/tables.service';
import { ProductsService } from '../products/products.service';
import { QrCodesService } from '../qr-codes/qr-codes.service';
import { User } from '../users/entities/user.entity';
import { OrdersGateway } from './orders.gateway';
import { TableStatus } from '../../common/enums/table-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly tablesService: TablesService,
    private readonly productsService: ProductsService,
    private readonly qrCodesService: QrCodesService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  // Crear pedido desde camarero o admin
  async createOrder(
    createOrderDto: CreateOrderDto,
    user: User,
  ): Promise<Order> {
    const { tableId, items, notes, customerName, source } = createOrderDto;

    // Verificar que la mesa existe
    const table = await this.tablesService.findOne(tableId);

    // Crear número de pedido único
    const orderNumber = await this.generateOrderNumber();

    // Calcular totales
    const { orderItems, subtotal } = await this.calculateOrderTotals(items);

    const tax = subtotal * 0.1; // 10% de impuestos (ajustar según tu país)
    const total = subtotal + tax;

    // Estimar tiempo de preparación
    const estimatedTime = this.calculateEstimatedTime(orderItems);

    // Crear pedido
    const order = this.orderRepository.create({
      orderNumber,
      table,
      status: OrderStatus.PENDING,
      source,
      createdBy: user,
      items: orderItems,
      subtotal,
      tax,
      total,
      notes,
      customerName,
      estimatedTime,
    });

    const savedOrder = await this.orderRepository.save(order);
    await this.tablesService.occupyTable(tableId);
    
    const fullOrder = await this.findOne(savedOrder.id);
    
    // AGREGAR: Notificar por WebSocket
    this.ordersGateway.notifyNewOrder(fullOrder);
    
    return fullOrder;
  }

  // Crear pedido desde QR (cliente sin autenticación)
   async createOrderFromQr(
    createOrderFromQrDto: CreateOrderFromQrDto,
  ): Promise<Order> {
    const { qrCode, items, notes, customerName } = createOrderFromQrDto;

    // Validar el código QR
    const qrCodeEntity = await this.qrCodesService.validateQrCode(qrCode);

    if (!qrCodeEntity.isValid()) {
      throw new BadRequestException('El código QR ha expirado');
    }

    // Crear el pedido
    const orderNumber = await this.generateOrderNumber();
    const { orderItems, subtotal } = await this.calculateOrderTotals(items);

    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    const estimatedTime = this.calculateEstimatedTime(orderItems);

    const order = this.orderRepository.create({
      orderNumber,
      table: qrCodeEntity.table,
      status: OrderStatus.PENDING,
      source: OrderSource.QR_CLIENT,
      createdBy: undefined, // Sin usuario autenticado
      items: orderItems,
      subtotal,
      tax,
      total,
      notes,
      customerName,
      estimatedTime,
    });

     const savedOrder = await this.orderRepository.save(order);
    await this.tablesService.occupyTable(qrCodeEntity.table.id);
    
    const fullOrder = await this.findOne(savedOrder.id);
    
    // AGREGAR: Notificar por WebSocket
    this.ordersGateway.notifyNewOrder(fullOrder);
    
    return fullOrder;
  }

  // Obtener todos los pedidos con filtros
  async findAll(filterDto?: FilterOrdersDto): Promise<Order[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.createdBy', 'createdBy');

    // Aplicar filtros
    if (filterDto?.status) {
      query.andWhere('order.status = :status', { status: filterDto.status });
    }

    if (filterDto?.source) {
      query.andWhere('order.source = :source', { source: filterDto.source });
    }

    if (filterDto?.tableId) {
      query.andWhere('table.id = :tableId', { tableId: filterDto.tableId });
    }

    if (filterDto?.startDate && filterDto?.endDate) {
      query.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filterDto.startDate,
        endDate: filterDto.endDate,
      });
    }

    return await query
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  // Obtener pedidos activos (pendientes, confirmados, en preparación)
  async findActiveOrders(): Promise<Order[]> {
    return await this.orderRepository.find({
      where: [
        { status: OrderStatus.PENDING },
        { status: OrderStatus.CONFIRMED },
        { status: OrderStatus.PREPARING },
        { status: OrderStatus.READY },
      ],
      relations: ['table', 'items', 'items.product', 'createdBy'],
      order: { createdAt: 'ASC' },
    });
  }

  // Obtener pedidos de hoy
  async findTodayOrders(): Promise<Order[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await this.orderRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
      relations: ['table', 'items', 'items.product', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  // Obtener un pedido por ID
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['table', 'items', 'items.product', 'createdBy'],
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return order;
  }

  // Obtener pedido por número
  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['table', 'items', 'items.product', 'createdBy'],
    });

    if (!order) {
      throw new NotFoundException(
        `Pedido ${orderNumber} no encontrado`,
      );
    }

    return order;
  }
  // Actualizar estado del pedido
    async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);
    const { status, notes } = updateStatusDto;
    const updatedOrder = await this.orderRepository.save(order);

    // Validar transiciones de estado
    this.validateStatusTransition(order.status, status);

    order.status = status;

    if (notes) {
      order.notes = order.notes
        ? `${order.notes}\n${notes}`
        : notes;
    }

    // Si el pedido se completa, marcar fecha de completado
    if (status === OrderStatus.DELIVERED) {
      order.completedAt = new Date();
      
      // Liberar la mesa si no hay más pedidos activos
      await this.checkAndReleaseTable(order.table.id);
    }

    // Si el pedido se cancela, liberar la mesa
   if (status === OrderStatus.CANCELLED) {
      this.ordersGateway.notifyOrderCancelled(updatedOrder);
    } else {
      this.ordersGateway.notifyOrderStatusUpdate(updatedOrder);
    }
    
    return updatedOrder;
  }


  // Confirmar pedido (Admin/Camarero)
  async confirmOrder(id: string): Promise<Order> {
    return await this.updateStatus(id, {
      status: OrderStatus.CONFIRMED,
    });
  }

  // Marcar como en preparación (Cocina)
  async startPreparing(id: string): Promise<Order> {
    return await this.updateStatus(id, {
      status: OrderStatus.PREPARING,
    });
  }

  // Marcar como listo (Cocina)
  async markAsReady(id: string): Promise<Order> {
    return await this.updateStatus(id, {
      status: OrderStatus.READY,
    });
  }

  // Marcar como entregado (Camarero)
  async markAsDelivered(id: string): Promise<Order> {
    return await this.updateStatus(id, {
      status: OrderStatus.DELIVERED,
    });
  }

  // Cancelar pedido
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    return await this.updateStatus(id, {
      status: OrderStatus.CANCELLED,
      notes: reason ? `Cancelado: ${reason}` : 'Pedido cancelado',
    });
  }

  // Obtener pedidos por mesa
  async findOrdersByTable(tableId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { table: { id: tableId } },
      relations: ['items', 'items.product', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  // Obtener pedidos activos de una mesa
  async findActiveOrdersByTable(tableId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: {
        table: { id: tableId },
        status: Between(OrderStatus.PENDING, OrderStatus.READY),
      },
      relations: ['items', 'items.product'],
      order: { createdAt: 'ASC' },
    });
  }

  // ========== MÉTODOS AUXILIARES ==========

  // Generar número de pedido único
  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Contar pedidos de hoy
    const startOfDay = new Date(year, today.getMonth(), today.getDate());
    const endOfDay = new Date(year, today.getMonth(), today.getDate(), 23, 59, 59);

    const todayOrdersCount = await this.orderRepository.count({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    const orderNumber = String(todayOrdersCount + 1).padStart(3, '0');

    return `ORD-${year}${month}${day}-${orderNumber}`;
  }

  // Calcular totales del pedido
  private async calculateOrderTotals(items: any[]): Promise<{
    orderItems: OrderItem[];
    subtotal: number;
  }> {
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await this.productsService.findOneProduct(item.productId);

      if (!product.isAvailable) {
        throw new BadRequestException(
          `El producto "${product.name}" no está disponible`,
        );
      }

      const unitPrice = Number(product.price);
      const itemSubtotal = unitPrice * item.quantity;

      const orderItem = this.orderItemRepository.create({
        product,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
        notes: item.notes,
      });

      orderItems.push(orderItem);
      subtotal += itemSubtotal;
    }

    return { orderItems, subtotal };
  }

  // Calcular tiempo estimado de preparación
  private calculateEstimatedTime(orderItems: OrderItem[]): number {
    let maxTime = 0;

    for (const item of orderItems) {
      const itemTime = item.product.preparationTime || 15; // 15 min por defecto
      if (itemTime > maxTime) {
        maxTime = itemTime;
      }
    }

    // Agregar 5 minutos base + tiempo del producto más lento
    return 5 + maxTime;
  }

  // Validar transiciones de estado
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [
        OrderStatus.CONFIRMED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.PREPARING,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PREPARING]: [
        OrderStatus.READY,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.READY]: [
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar de ${currentStatus} a ${newStatus}`,
      );
    }
  }

  // Verificar y liberar mesa si no hay pedidos activos
  private async checkAndReleaseTable(tableId: string): Promise<void> {
    const activeOrders = await this.findActiveOrdersByTable(tableId);

    if (activeOrders.length === 0) {
      await this.tablesService.releaseTable(tableId);
    }
  }
  
  // ========== ESTADÍSTICAS ==========

  // Obtener estadísticas generales
  async getStatistics(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate);
    }

    const totalOrders = await this.orderRepository.count({ where: whereClause });

    const completedOrders = await this.orderRepository.count({
      where: { ...whereClause, status: OrderStatus.DELIVERED },
    });

    const cancelledOrders = await this.orderRepository.count({
      where: { ...whereClause, status: OrderStatus.CANCELLED },
    });

    const pendingOrders = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING },
    });

    const preparingOrders = await this.orderRepository.count({
      where: { status: OrderStatus.PREPARING },
    });

    const readyOrders = await this.orderRepository.count({
      where: { status: OrderStatus.READY },
    });

    // Calcular ingresos totales
    const orders = await this.orderRepository.find({
      where: { ...whereClause, status: OrderStatus.DELIVERED },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    const averageOrderValue = totalOrders > 0 ? totalRevenue / completedOrders : 0;

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      totalRevenue: totalRevenue.toFixed(2),
      averageOrderValue: averageOrderValue.toFixed(2),
      completionRate:
        totalOrders > 0
          ? ((completedOrders / totalOrders) * 100).toFixed(2)
          : 0,
    };
  }

  // Obtener productos más vendidos
  async getBestSellingProducts(limit = 10) {
    const result = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoin('orderItem.order', 'order')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(orderItem.quantity)', 'totalQuantity')
      .addSelect('SUM(orderItem.subtotal)', 'totalRevenue')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalQuantity: parseInt(item.totalQuantity),
      totalRevenue: parseFloat(item.totalRevenue).toFixed(2),
    }));
  }

  // Obtener ventas por día
  async getSalesByDay(days = 7) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.total)', 'totalSales')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere('order.createdAt >= :startDate', {
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'DESC')
      .getRawMany();

    return result.map((item) => ({
      date: item.date,
      orderCount: parseInt(item.orderCount),
      totalSales: parseFloat(item.totalSales).toFixed(2),
    }));
  }

  // Obtener pedidos por fuente
  async getOrdersBySource() {
    const qrOrders = await this.orderRepository.count({
      where: { source: OrderSource.QR_CLIENT },
    });

    const waiterOrders = await this.orderRepository.count({
      where: { source: OrderSource.WAITER },
    });

    const adminOrders = await this.orderRepository.count({
      where: { source: OrderSource.ADMIN },
    });

    const total = qrOrders + waiterOrders + adminOrders;

    return {
      qrOrders,
      waiterOrders,
      adminOrders,
      total,
      qrPercentage: total > 0 ? ((qrOrders / total) * 100).toFixed(2) : 0,
      waiterPercentage: total > 0 ? ((waiterOrders / total) * 100).toFixed(2) : 0,
      adminPercentage: total > 0 ? ((adminOrders / total) * 100).toFixed(2) : 0,
    };
  }

  // Obtener tiempo promedio de preparación
  async getAveragePreparationTime() {
    const orders = await this.orderRepository.find({
      where: { status: OrderStatus.DELIVERED },
      select: ['createdAt', 'completedAt'],
    });

    if (orders.length === 0) {
      return { averageMinutes: 0, totalOrders: 0 };
    }

    const totalMinutes = orders.reduce((sum, order) => {
      if (order.completedAt) {
        const diff = order.completedAt.getTime() - order.createdAt.getTime();
        return sum + diff / 1000 / 60; // Convertir a minutos
      }
      return sum;
    }, 0);

    return {
      averageMinutes: (totalMinutes / orders.length).toFixed(2),
      totalOrders: orders.length,
    };
  }

  // Dashboard completo
  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await this.getStatistics(today, new Date());
    const activeOrders = await this.findActiveOrders();
    const bestSelling = await this.getBestSellingProducts(5);
    const salesByDay = await this.getSalesByDay(7);
    const ordersBySource = await this.getOrdersBySource();
    const avgPrepTime = await this.getAveragePreparationTime();

    return {
      today: todayStats,
      activeOrders: activeOrders.length,
      bestSellingProducts: bestSelling,
      salesByDay,
      ordersBySource,
      averagePreparationTime: avgPrepTime,
    };
  }
}
