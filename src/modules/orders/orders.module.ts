// src/modules/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { TablesModule } from '../tables/tables.module';
import { ProductsModule } from '../products/products.module';
import { QrCodesModule } from '../qr-codes/qr-codes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    TablesModule,
    ProductsModule,
    QrCodesModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}