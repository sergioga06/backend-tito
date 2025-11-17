// src/database/seeds/index.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedAdmin} from './admin.seed';
import { seedStaff } from './staff.seed';
import { seedTables } from './tables.seed';
import { seedProducts } from './products.seed';

// Cargar variables de entorno
config();

// Configuración de la base de datos
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: true, // Solo para desarrollo
});

async function runSeeds() {
  try {
    console.log('🌱 Iniciando seeds...\n');

    // Inicializar conexión
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida\n');

    // Ejecutar seeds en orden
    console.log('👤 Creando usuarios...');
    await seedAdmin(AppDataSource);
    await seedStaff(AppDataSource);
    console.log('');

    console.log('🪑 Creando mesas...');
    await seedTables(AppDataSource);
    console.log('');

    console.log('🍕 Creando productos y categorías...');
    await seedProducts(AppDataSource);
    console.log('');

    console.log('✅ Seeds completados exitosamente!\n');
    console.log('📋 Credenciales de acceso:');
    console.log('   Admin:');
    console.log('     Email: admin@eltito.com');
    console.log('     Password: Admin123!');
    console.log('');
    console.log('   Cocina:');
    console.log('     Email: cocina@eltito.com');
    console.log('     Password: Cocina123!');
    console.log('');
    console.log('   Camarero:');
    console.log('     Email: camarero1@eltito.com');
    console.log('     Password: Camarero123!');
    console.log('');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    process.exit(1);
  }
}

runSeeds();