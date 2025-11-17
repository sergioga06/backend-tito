import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
// src/database/seeds/staff.seed.ts
export async function seedStaff(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const staffUsers = [
    {
      email: 'cocina@eltito.com',
      name: 'Jefe de Cocina',
      password: 'Cocina123!',
      role: UserRole.KITCHEN_MANAGER,
    },
    {
      email: 'camarero1@eltito.com',
      name: 'Camarero Principal',
      password: 'Camarero123!',
      role: UserRole.WAITER,
    },
    {
      email: 'camarero2@eltito.com',
      name: 'Camarero Secundario',
      password: 'Camarero123!',
      role: UserRole.WAITER,
    },
  ];

  for (const userData of staffUsers) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
        isActive: true,
      });

      await userRepository.save(user);
      console.log(`✅ Usuario creado: ${userData.email}`);
    }
  }
}