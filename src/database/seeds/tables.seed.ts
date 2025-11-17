// src/database/seeds/tables.seed.ts
import { DataSource } from 'typeorm';
import { Table } from '../../modules/tables/entities/table.entity';
import { TableStatus } from '../../common/enums/table-status.enum';

export async function seedTables(dataSource: DataSource) {
  const tableRepository = dataSource.getRepository(Table);

  // Verificar si ya existen mesas
  const existingTables = await tableRepository.count();

  if (existingTables > 0) {
    console.log('✅ Las mesas ya existen');
    return;
  }

  // Crear mesas de ejemplo
  const tables = [
    // Interior - Mesas pequeñas
    { number: 1, name: 'Mesa 1', capacity: 2, location: 'Interior', status: TableStatus.AVAILABLE },
    { number: 2, name: 'Mesa 2', capacity: 2, location: 'Interior', status: TableStatus.AVAILABLE },
    { number: 3, name: 'Mesa 3', capacity: 2, location: 'Interior', status: TableStatus.AVAILABLE },
    { number: 4, name: 'Mesa 4', capacity: 2, location: 'Interior', status: TableStatus.AVAILABLE },
    
    // Interior - Mesas medianas
    { number: 5, name: 'Mesa 5', capacity: 4, location: 'Interior', status: TableStatus.AVAILABLE },
    { number: 6, name: 'Mesa 6', capacity: 4, location: 'Interior', status: TableStatus.AVAILABLE },
    { number: 7, name: 'Mesa 7', capacity: 4, location: 'Interior', status: TableStatus.AVAILABLE },
    { number: 8, name: 'Mesa 8', capacity: 4, location: 'Interior', status: TableStatus.AVAILABLE },
    
    // Interior - Mesas grandes
    { number: 9, name: 'Mesa 9', capacity: 6, location: 'Interior', status: TableStatus.AVAILABLE },
    { number: 10, name: 'Mesa 10', capacity: 6, location: 'Interior', status: TableStatus.AVAILABLE },
    
    // Terraza
    { number: 11, name: 'Terraza 1', capacity: 4, location: 'Terraza', status: TableStatus.AVAILABLE },
    { number: 12, name: 'Terraza 2', capacity: 4, location: 'Terraza', status: TableStatus.AVAILABLE },
    { number: 13, name: 'Terraza 3', capacity: 4, location: 'Terraza', status: TableStatus.AVAILABLE },
    { number: 14, name: 'Terraza 4', capacity: 4, location: 'Terraza', status: TableStatus.AVAILABLE },
    
    // VIP
    { number: 15, name: 'Mesa VIP', capacity: 8, location: 'Salón VIP', status: TableStatus.AVAILABLE },
  ];

  for (const tableData of tables) {
    const table = tableRepository.create(tableData);
    await tableRepository.save(table);
    console.log(`✅ Mesa ${tableData.number} creada`);
  }

  console.log(`✅ Total: ${tables.length} mesas creadas`);
}