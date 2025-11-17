// src/modules/orders/orders.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Order } from './entities/order.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('OrdersGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Suscribirse a una sala específica (por rol o mesa)
  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, data: { room: string }) {
    client.join(data.room);
    this.logger.log(`Cliente ${client.id} se unió a la sala: ${data.room}`);
    return { event: 'subscribed', data: { room: data.room } };
  }

  // Desuscribirse de una sala
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, data: { room: string }) {
    client.leave(data.room);
    this.logger.log(`Cliente ${client.id} salió de la sala: ${data.room}`);
    return { event: 'unsubscribed', data: { room: data.room } };
  }

  // ========== EVENTOS PARA EMITIR ==========

  // Notificar nuevo pedido
  notifyNewOrder(order: Order) {
    this.logger.log(`Nuevo pedido creado: ${order.orderNumber}`);
    
    // Notificar a todos los usuarios autenticados
    this.server.emit('order:new', {
      message: 'Nuevo pedido recibido',
      order: this.formatOrder(order),
    });

    // Notificar específicamente a la cocina
    this.server.to('kitchen').emit('order:new', {
      message: 'Nuevo pedido para preparar',
      order: this.formatOrder(order),
    });

    // Notificar a los camareros
    this.server.to('waiters').emit('order:new', {
      message: 'Nuevo pedido en tu sección',
      order: this.formatOrder(order),
    });
  }

  // Notificar actualización de estado
  notifyOrderStatusUpdate(order: Order) {
    this.logger.log(
      `Pedido actualizado: ${order.orderNumber} - ${order.status}`,
    );

    // Notificar a todos
    this.server.emit('order:updated', {
      message: `Pedido ${order.orderNumber} actualizado`,
      order: this.formatOrder(order),
    });

    // Notificar a la mesa específica (para clientes)
    this.server.to(`table:${order.table.id}`).emit('order:status-changed', {
      message: `Tu pedido está ${this.getStatusMessage(order.status)}`,
      order: this.formatOrder(order),
    });

    // Notificar según el estado
    switch (order.status) {
      case 'confirmed':
        this.server.to('kitchen').emit('order:confirmed', {
          message: 'Pedido confirmado, listo para preparar',
          order: this.formatOrder(order),
        });
        break;

      case 'preparing':
        this.server.to('waiters').emit('order:preparing', {
          message: 'Pedido en preparación',
          order: this.formatOrder(order),
        });
        break;

      case 'ready':
        this.server.to('waiters').emit('order:ready', {
          message: 'Pedido listo para servir',
          order: this.formatOrder(order),
        });
        break;

      case 'delivered':
        this.server.to('admin').emit('order:completed', {
          message: 'Pedido completado',
          order: this.formatOrder(order),
        });
        break;

      case 'cancelled':
        this.server.emit('order:cancelled', {
          message: 'Pedido cancelado',
          order: this.formatOrder(order),
        });
        break;
    }
  }

  // Notificar pedido cancelado
  notifyOrderCancelled(order: Order) {
    this.logger.log(`Pedido cancelado: ${order.orderNumber}`);

    this.server.emit('order:cancelled', {
      message: `Pedido ${order.orderNumber} cancelado`,
      order: this.formatOrder(order),
    });
  }

  // ========== MÉTODOS AUXILIARES ==========

  private formatOrder(order: Order) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      source: order.source,
      table: {
        id: order.table.id,
        number: order.table.number,
        name: order.table.name,
      },
      items: order.items?.map((item) => ({
        product: item.product.name,
        quantity: item.quantity,
        notes: item.notes,
      })),
      total: order.total,
      estimatedTime: order.estimatedTime,
      createdAt: order.createdAt,
    };
  }

  private getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      pending: 'pendiente de confirmación',
      confirmed: 'confirmado',
      preparing: 'en preparación',
      ready: 'listo para servir',
      delivered: 'entregado',
      cancelled: 'cancelado',
    };

    return messages[status] || status;
  }
}