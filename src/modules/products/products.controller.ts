// src/modules/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ========== ENDPOINTS PÚBLICOS (sin autenticación) ==========

  // Obtener menú completo - PÚBLICO
  @Get('menu')
  async getMenu() {
    return await this.productsService.getMenu();
  }

  // Obtener productos disponibles - PÚBLICO
  @Get('available')
  async findAvailable() {
    return await this.productsService.findAvailableProducts();
  }

  // Buscar productos - PÚBLICO
  @Get('search')
  async search(@Query('q') query: string) {
    return await this.productsService.searchProducts(query);
  }

  // ========== CATEGORÍAS (Protegidos) ==========

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.productsService.createCategory(createCategoryDto);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KITCHEN_MANAGER)
  async findAllCategories(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    return await this.productsService.findAllCategories(include);
  }

  @Get('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KITCHEN_MANAGER)
  async findOneCategory(@Param('id') id: string) {
    return await this.productsService.findOneCategory(id);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.productsService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeCategory(@Param('id') id: string) {
    await this.productsService.removeCategory(id);
    return { message: 'Categoría eliminada correctamente' };
  }

  // ========== PRODUCTOS (Protegidos) ==========

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.createProduct(createProductDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KITCHEN_MANAGER)
  async findAllProducts(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    return await this.productsService.findAllProducts(include);
  }

  @Get('category/:categoryId')
  async findProductsByCategory(@Param('categoryId') categoryId: string) {
    return await this.productsService.findProductsByCategory(categoryId);
  }

  @Get(':id')
  async findOneProduct(@Param('id') id: string) {
    return await this.productsService.findOneProduct(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.updateProduct(id, updateProductDto);
  }

  @Patch(':id/toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KITCHEN_MANAGER)
  async toggleAvailability(@Param('id') id: string) {
    return await this.productsService.toggleAvailability(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeProduct(@Param('id') id: string) {
    await this.productsService.removeProduct(id);
    return { message: 'Producto eliminado correctamente' };
  }
}