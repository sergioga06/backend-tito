// src/modules/orders/entities/order.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { OrderSource } from '../../../common/enums/order-source.enum';
import { Table } from '../../tables/entities/table.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string; // Ej: "ORD-20250106-001"

  @ManyToOne(() => Table, (table) => table.orders)
  table: Table;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderSource,
  })
  source: OrderSource;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  createdBy: User; // Camarero o admin que creó el pedido (null si es del cliente)

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'text', nullable: true })
  notes: string; // Notas del cliente o camarero

  @Column({ nullable: true })
  customerName: string; // Nombre del cliente (opcional)

  @Column({ nullable: true })
  estimatedTime: number; // Tiempo estimado en minutos

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

