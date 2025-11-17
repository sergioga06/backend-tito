
// src/modules/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, role } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      role,
    });

    await this.userRepository.save(user);

    // Generar token
    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token
    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return user;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}