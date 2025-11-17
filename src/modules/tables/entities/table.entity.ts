// src/modules/tables/entities/table.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TableStatus } from '../../../common/enums/table-status.enum';
import { Order } from '../../orders/entities/order.entity';
import { QrCode } from '../../qr-codes/entities/qr-code.entity';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: number;

  @Column({ nullable: true })
  name: string; // Ej: "Mesa VIP", "Terraza 1"

  @Column({ default: 4 })
  capacity: number;

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  status: TableStatus;

  @Column({ nullable: true })
  location: string; // Ej: "Interior", "Terraza", "Salón principal"

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];

  @OneToOne(() => QrCode, (qrCode) => qrCode.table)
  qrCode: QrCode;
}