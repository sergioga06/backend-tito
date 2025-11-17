// src/modules/orders/entities/order-item.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems)
  product: Product;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // Precio unitario al momento del pedido

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // quantity * unitPrice

  @Column({ type: 'text', nullable: true })
  notes: string; // Notas específicas del item (ej: "sin cebolla")

  @CreateDateColumn()
  createdAt: Date;
}