// src/modules/products/products.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // ========== CATEGORÍAS ==========

  // Crear categoría
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name } = createCategoryDto;

    const existingCategory = await this.categoryRepository.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException(`La categoría "${name}" ya existe`);
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  // Obtener todas las categorías
  async findAllCategories(includeInactive = false): Promise<Category[]> {
    const where = includeInactive ? {} : { isActive: true };

    return await this.categoryRepository.find({
      where,
      relations: ['products'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  // Obtener categoría por ID
  async findOneCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  // Actualizar categoría
  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOneCategory(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException(
          `La categoría "${updateCategoryDto.name}" ya existe`,
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  // Eliminar categoría
  async removeCategory(id: string): Promise<void> {
    const category = await this.findOneCategory(id);

    // Verificar si tiene productos asociados
    if (category.products && category.products.length > 0) {
      throw new ConflictException(
        'No se puede eliminar una categoría con productos asociados',
      );
    }

    await this.categoryRepository.remove(category);
  }

  // ========== PRODUCTOS ==========

  // Crear producto
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, ...productData } = createProductDto;

    // Verificar que la categoría existe
    const category = await this.findOneCategory(categoryId);

    const product = this.productRepository.create({
      ...productData,
      category,
    });

    return await this.productRepository.save(product);
  }

  // Obtener todos los productos
  async findAllProducts(includeInactive = false): Promise<Product[]> {
    const where = includeInactive ? {} : { isActive: true };

    return await this.productRepository.find({
      where,
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  // Obtener productos disponibles (para clientes)
  async findAvailableProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      where: { isActive: true, isAvailable: true },
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  // Obtener productos por categoría
  async findProductsByCategory(categoryId: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: {
        category: { id: categoryId },
        isActive: true,
        isAvailable: true,
      },
      order: { name: 'ASC' },
    });
  }

  // Obtener producto por ID
  async findOneProduct(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  // Actualizar producto
  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOneProduct(id);

    const { categoryId, ...productData } = updateProductDto;

    // Si se cambia la categoría, verificar que existe
    if (categoryId) {
      const category = await this.findOneCategory(categoryId);
      product.category = category;
    }

    Object.assign(product, productData);
    return await this.productRepository.save(product);
  }

  // Cambiar disponibilidad de producto
  async toggleAvailability(id: string): Promise<Product> {
    const product = await this.findOneProduct(id);
    product.isAvailable = !product.isAvailable;
    return await this.productRepository.save(product);
  }

  // Eliminar producto
  async removeProduct(id: string): Promise<void> {
    const product = await this.findOneProduct(id);
    await this.productRepository.remove(product);
  }

  // Buscar productos
  async searchProducts(query: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere(
        '(LOWER(product.name) LIKE LOWER(:query) OR LOWER(product.description) LIKE LOWER(:query))',
        { query: `%${query}%` },
      )
      .orderBy('product.name', 'ASC')
      .getMany();
  }

  // Obtener menú completo (categorías con productos)
  async getMenu(): Promise<Category[]> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'product')
      .where('category.isActive = :isActive', { isActive: true })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .andWhere('product.isAvailable = :isAvailable', { isAvailable: true })
      .orderBy('category.order', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .addOrderBy('product.name', 'ASC')
      .getMany();
  }
}