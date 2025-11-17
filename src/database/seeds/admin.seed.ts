// src/database/seeds/admin.seed.ts
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export async function seedAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  // Verificar si ya existe un admin
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@eltito.com' },
  });

  if (existingAdmin) {
    console.log('✅ Usuario administrador ya existe');
    return;
  }

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const admin = userRepository.create({
    email: 'admin@eltito.com',
    name: 'Administrador',
    password: hashedPassword,
    role: UserRole.ADMIN,
    isActive: true,
  });

  await userRepository.save(admin);

  console.log('✅ Usuario administrador creado:');
  console.log('   Email: admin@eltito.com');
  console.log('   Password: Admin123!');
  console.log('   ⚠️  Cambia esta contraseña en producción');
}