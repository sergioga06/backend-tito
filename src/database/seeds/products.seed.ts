// src/database/seeds/products.seed.ts
import { DataSource } from 'typeorm';
import { Category } from '../../modules/products/entities/category.entity';
import { Product } from '../../modules/products/entities/product.entity';

export async function seedProducts(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category);
  const productRepository = dataSource.getRepository(Product);

  // Verificar si ya existen productos
  const existingProducts = await productRepository.count();

  if (existingProducts > 0) {
    console.log('✅ Los productos ya existen');
    return;
  }

  // Crear categorías
  const pizzasCategory = categoryRepository.create({
    name: 'Pizzas',
    description: 'Pizzas artesanales con masa madre',
    icon: '🍕',
    order: 1,
  });
  await categoryRepository.save(pizzasCategory);

  const pastasCategory = categoryRepository.create({
    name: 'Pastas',
    description: 'Pastas frescas hechas en casa',
    icon: '🍝',
    order: 2,
  });
  await categoryRepository.save(pastasCategory);

  const bebidasCategory = categoryRepository.create({
    name: 'Bebidas',
    description: 'Bebidas frías y calientes',
    icon: '🥤',
    order: 3,
  });
  await categoryRepository.save(bebidasCategory);

  const postresCategory = categoryRepository.create({
    name: 'Postres',
    description: 'Deliciosos postres caseros',
    icon: '🍰',
    order: 4,
  });
  await categoryRepository.save(postresCategory);

  const entradasCategory = categoryRepository.create({
    name: 'Entradas',
    description: 'Para compartir',
    icon: '🥗',
    order: 0,
  });
  await categoryRepository.save(entradasCategory);

  // Crear productos - PIZZAS
  const pizzas = [
    {
      name: 'Margherita',
      description: 'Tomate, mozzarella, albahaca fresca y aceite de oliva',
      price: 8.50,
      category: pizzasCategory,
      preparationTime: 15,
      isVegetarian: true,
    },
    {
      name: 'Pepperoni',
      description: 'Tomate, mozzarella y pepperoni',
      price: 9.50,
      category: pizzasCategory,
      preparationTime: 15,
    },
    {
      name: 'Cuatro Quesos',
      description: 'Mozzarella, gorgonzola, parmesano y provolone',
      price: 10.50,
      category: pizzasCategory,
      preparationTime: 15,
      isVegetarian: true,
    },
    {
      name: 'Hawaiana',
      description: 'Tomate, mozzarella, jamón y piña',
      price: 9.50,
      category: pizzasCategory,
      preparationTime: 15,
    },
    {
      name: 'Carbonara',
      description: 'Nata, bacon, champiñones, mozzarella y huevo',
      price: 10.50,
      category: pizzasCategory,
      preparationTime: 18,
    },
    {
      name: 'Vegetal',
      description: 'Tomate, mozzarella, pimientos, cebolla, champiñones y aceitunas',
      price: 9.50,
      category: pizzasCategory,
      preparationTime: 15,
      isVegetarian: true,
      isVegan: false,
    },
  ];

  for (const pizzaData of pizzas) {
    const pizza = productRepository.create(pizzaData);
    await productRepository.save(pizza);
  }

  // Crear productos - PASTAS
  const pastas = [
    {
      name: 'Spaghetti Carbonara',
      description: 'Pasta con bacon, huevo, parmesano y pimienta negra',
      price: 8.50,
      category: pastasCategory,
      preparationTime: 12,
    },
    {
      name: 'Penne Arrabiata',
      description: 'Pasta con salsa de tomate picante',
      price: 7.50,
      category: pastasCategory,
      preparationTime: 12,
      isVegetarian: true,
    },
    {
      name: 'Lasagna Bolognesa',
      description: 'Capas de pasta con carne, bechamel y queso',
      price: 10.50,
      category: pastasCategory,
      preparationTime: 20,
    },
    {
      name: 'Ravioli de Ricotta',
      description: 'Raviolis rellenos de ricotta y espinacas',
      price: 9.50,
      category: pastasCategory,
      preparationTime: 15,
      isVegetarian: true,
    },
  ];

  for (const pastaData of pastas) {
    const pasta = productRepository.create(pastaData);
    await productRepository.save(pasta);
  }

  // Crear productos - BEBIDAS
  const bebidas = [
    {
      name: 'Coca-Cola',
      description: 'Refresco de cola 330ml',
      price: 2.50,
      category: bebidasCategory,
      preparationTime: 1,
      isVegetarian: true,
      isVegan: true,
    },
    {
      name: 'Agua Mineral',
      description: 'Agua mineral 500ml',
      price: 1.50,
      category: bebidasCategory,
      preparationTime: 1,
      isVegetarian: true,
      isVegan: true,
    },
    {
      name: 'Cerveza Estrella',
      description: 'Cerveza española 330ml',
      price: 2.80,
      category: bebidasCategory,
      preparationTime: 1,
      isVegetarian: true,
      isVegan: true,
    },
    {
      name: 'Vino Tinto',
      description: 'Copa de vino tinto reserva',
      price: 3.50,
      category: bebidasCategory,
      preparationTime: 2,
      isVegetarian: true,
      isVegan: true,
    },
  ];

  for (const bebidaData of bebidas) {
    const bebida = productRepository.create(bebidaData);
    await productRepository.save(bebida);
  }

  // Crear productos - POSTRES
  const postres = [
    {
      name: 'Tiramisú',
      description: 'Postre italiano con café y mascarpone',
      price: 5.50,
      category: postresCategory,
      preparationTime: 5,
      isVegetarian: true,
    },
    {
      name: 'Panna Cotta',
      description: 'Postre cremoso con coulis de frutos rojos',
      price: 4.50,
      category: postresCategory,
      preparationTime: 5,
      isVegetarian: true,
    },
    {
      name: 'Tarta de Queso',
      description: 'Tarta de queso cremosa con base de galleta',
      price: 5.00,
      category: postresCategory,
      preparationTime: 5,
      isVegetarian: true,
    },
  ];

  for (const postreData of postres) {
    const postre = productRepository.create(postreData);
    await productRepository.save(postre);
  }

  // Crear productos - ENTRADAS
  const entradas = [
    {
      name: 'Bruschetta',
      description: 'Pan tostado con tomate, albahaca y ajo',
      price: 4.50,
      category: entradasCategory,
      preparationTime: 8,
      isVegetarian: true,
    },
    {
      name: 'Ensalada Caprese',
      description: 'Tomate, mozzarella fresca, albahaca y aceite de oliva',
      price: 6.50,
      category: entradasCategory,
      preparationTime: 8,
      isVegetarian: true,
    },
    {
      name: 'Alitas de Pollo',
      description: '8 alitas de pollo picantes con salsa barbacoa',
      price: 7.50,
      category: entradasCategory,
      preparationTime: 15,
    },
  ];

  for (const entradaData of entradas) {
    const entrada = productRepository.create(entradaData);
    await productRepository.save(entrada);
  }

  console.log('✅ Productos y categorías creados correctamente');
}