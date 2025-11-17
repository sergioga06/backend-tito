// src/modules/qr-codes/entities/qr-code.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Table } from '../../tables/entities/table.entity';

@Entity('qr_codes')
export class QrCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Table, (table) => table.qrCode)
  @JoinColumn()
  table: Table;

  @Column({ unique: true })
  code: string; // UUID único para el QR

  @Column({ type: 'text' })
  qrImageBase64: string; // Imagen del QR en base64

  @Column()
  expirationDate: Date; // Fecha de expiración (mensual)

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Método para verificar si el QR está expirado
  isExpired(): boolean {
    return new Date() > this.expirationDate;
  }

  // Método para verificar si el QR es válido
  isValid(): boolean {
    return this.isActive && !this.isExpired();
  }
}