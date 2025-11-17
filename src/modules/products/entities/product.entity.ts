// src/modules/products/entities/product.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Category } from './category.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  image: string; // URL de la imagen

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @Column({ default: true })
  isAvailable: boolean; // Si está disponible actualmente

  @Column({ default: true })
  isActive: boolean; // Si está activo en el sistema

  @Column({ default: 0 })
  preparationTime: number; // Tiempo estimado en minutos

  @Column({ type: 'simple-array', nullable: true })
  allergens: string[]; // Alergenos

  @Column({ default: false })
  isVegetarian: boolean;

  @Column({ default: false })
  isVegan: boolean;

  @Column({ default: false })
  isGlutenFree: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}