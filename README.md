# 🍕 El Tito Pizzería - Backend

Sistema de gestión de pedidos para restaurante con soporte para pedidos QR, gestión de personal y cocina en tiempo real.

## 📋 Características

- 🔐 **Autenticación JWT** con roles (Admin, Cocina, Camarero)
- 📱 **Pedidos desde QR** sin necesidad de registro
- 👨‍💼 **Gestión de personal** con permisos diferenciados
- 🍕 **Catálogo de productos** con categorías y disponibilidad
- 🪑 **Gestión de mesas** con estados y QR dinámicos
- 📊 **Dashboard en tiempo real** con estadísticas
- 🔔 **Notificaciones WebSocket** para actualizaciones instantáneas
- 📈 **Reportes y métricas** de ventas y productos

## 🛠️ Tecnologías

- **NestJS** - Framework backend
- **PostgreSQL** - Base de datos
- **TypeORM** - ORM
- **JWT** - Autenticación
- **Socket.io** - WebSockets para tiempo real
- **QRCode** - Generación de códigos QR

## 🚀 Instalación

### Prerrequisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone <tu-repo>
cd el-tito-pizzeria-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=el_tito_pizzeria

# JWT
JWT_SECRET=tu_super_secreto_cambiar_en_produccion
JWT_EXPIRATION=7d

# App
PORT=3000
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173

# QR Codes
QR_BASE_URL=http://localhost:5173/mesa
```

4. **Crear la base de datos**
```bash
psql -U postgres
CREATE DATABASE el_tito_pizzeria;
\q
```

5. **Ejecutar migraciones y seeds**
```bash
npm run seed
```

6. **Iniciar el servidor**
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 👥 Usuarios de Prueba

Después de ejecutar los seeds, tendrás estos usuarios:

### Administrador
- **Email:** admin@eltito.com
- **Password:** Admin123!
- **Permisos:** Acceso completo al sistema

### Jefe de Cocina
- **Email:** cocina@eltito.com
- **Password:** Cocina123!
- **Permisos:** Gestión de pedidos y productos

### Camarero
- **Email:** camarero1@eltito.com
- **Password:** Camarero123!
- **Permisos:** Crear y gestionar pedidos

⚠️ **Importante:** Cambia estas contraseñas en producción.

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil (requiere auth)

### Usuarios (Admin)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Mesas (Auth)
- `GET /api/tables` - Listar mesas
- `POST /api/tables` - Crear mesa (Admin)
- `PATCH /api/tables/:id` - Actualizar mesa (Admin)
- `POST /api/tables/:id/occupy` - Ocupar mesa
- `POST /api/tables/:id/release` - Liberar mesa

### Códigos QR (Admin)
- `GET /api/qr-codes` - Listar QRs
- `POST /api/qr-codes/generate/table/:id` - Generar QR para mesa
- `POST /api/qr-codes/generate/all` - Generar QRs para todas
- `POST /api/qr-codes/renew/all` - Renovar todos los QRs
- `GET /api/qr-codes/validate/:code` - Validar QR (público)

### Productos (Mixto)
- `GET /api/products/menu` - Obtener menú (público)
- `GET /api/products/available` - Productos disponibles (público)
- `GET /api/products/search?q=pizza` - Buscar productos (público)
- `POST /api/products` - Crear producto (Admin)
- `PATCH /api/products/:id` - Actualizar producto (Admin)

### Categorías (Admin)
- `GET /api/products/categories` - Listar categorías
- `POST /api/products/categories` - Crear categoría
- `PATCH /api/products/categories/:id` - Actualizar categoría

### Pedidos
- `POST /api/orders/from-qr` - Crear pedido desde QR (público)
- `GET /api/orders/track/:orderNumber` - Rastrear pedido (público)
- `POST /api/orders` - Crear pedido (Auth)
- `GET /api/orders` - Listar pedidos (Auth)
- `GET /api/orders/active` - Pedidos activos (Auth)
- `GET /api/orders/dashboard` - Dashboard (Admin/Cocina)
- `POST /api/orders/:id/confirm` - Confirmar pedido (Admin/Camarero)
- `POST /api/orders/:id/start-preparing` - Iniciar preparación (Cocina)
- `POST /api/orders/:id/ready` - Marcar listo (Cocina)
- `POST /api/orders/:id/delivered` - Marcar entregado (Camarero)
- `POST /api/orders/:id/cancel` - Cancelar pedido (Admin/Camarero)

## 🔌 WebSockets

### Conexión
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/orders');
```

### Eventos disponibles

**Suscribirse a una sala:**
```javascript
socket.emit('subscribe', { room: 'kitchen' });
// Salas: 'kitchen', 'waiters', 'admin', 'table:ID'
```

**Escuchar eventos:**
```javascript
// Nuevo pedido
socket.on('order:new', (data) => {
  console.log('Nuevo pedido:', data.order);
});

// Actualización de estado
socket.on('order:updated', (data) => {
  console.log('Pedido actualizado:', data.order);
});

// Pedido listo
socket.on('order:ready', (data) => {
  console.log('Pedido listo:', data.order);
});

// Pedido cancelado
socket.on('order:cancelled', (data) => {
  console.log('Pedido cancelado:', data.order);
});
```

## 📊 Estructura del Proyecto

```
src/
├── common/               # Utilidades compartidas
│   ├── decorators/      # Decoradores personalizados
│   ├── enums/          # Enumeraciones
│   └── guards/         # Guards de autenticación
├── config/              # Configuraciones
├── database/            # Migraciones y seeds
└── modules/             # Módulos de la aplicación
    ├── auth/           # Autenticación
    ├── users/          # Gestión de usuarios
    ├── tables/         # Gestión de mesas
    ├── qr-codes/       # Códigos QR
    ├── products/       # Productos y categorías
    └── orders/         # Pedidos y WebSockets
```

## 🔒 Roles y Permisos

### Admin
- Gestión completa de usuarios
- Gestión de mesas
- Generación y renovación de QRs
- Gestión de productos y categorías
- Ver todas las estadísticas
- Confirmar y cancelar pedidos

### Kitchen Manager (Cocina)
- Ver pedidos activos
- Cambiar estado de pedidos (preparando, listo)
- Ver estadísticas de cocina
- Cambiar disponibilidad de productos

### Waiter (Camarero)
- Crear pedidos manualmente
- Confirmar pedidos
- Marcar pedidos como entregados
- Gestionar estados de mesas
- Cancelar pedidos

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Scripts Disponibles

```bash
npm run start:dev      # Desarrollo con hot-reload
npm run build          # Compilar para producción
npm run start:prod     # Ejecutar en producción
npm run seed           # Ejecutar seeds
npm run lint           # Linter
npm run format         # Formatear código
```

## 🚀 Despliegue

### Variables de entorno en producción

Asegúrate de configurar:
- `NODE_ENV=production`
- `DB_*` con credenciales seguras
- `JWT_SECRET` con un secreto fuerte
- `FRONTEND_URL` con la URL de tu frontend

### Recomendaciones

1. Usa SSL para PostgreSQL
2. Configura CORS correctamente
3. Implementa rate limiting
4. Usa helmet para seguridad
5. Configura logs con winston
6. Implementa health checks

## 📝 Licencia

MIT

## 👥 Autor

Tu Nombre - [Tu GitHub](https://github.com/tu-usuario)