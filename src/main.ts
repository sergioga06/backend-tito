// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener ConfigService
  const configService = app.get(ConfigService);

  // Configurar CORS
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configurar prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Eliminar propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades no permitidas
      transform: true, // Transformar tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Puerto de la aplicación
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  console.log(`
  🚀 Servidor corriendo en: http://localhost:${port}
  📚 API disponible en: http://localhost:${port}/api
  🔌 WebSockets en: ws://localhost:${port}
  🌍 Entorno: ${configService.get<string>('NODE_ENV')}
  `);
}

bootstrap();
