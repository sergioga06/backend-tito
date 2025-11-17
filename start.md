# 🚀 Guía de Inicio Rápido - El Tito Pizzería Backend

## ⚡ Instalación en 5 minutos

### 1. Prerrequisitos

Asegúrate de tener instalado:
- ✅ Node.js 18+ ([Descargar](https://nodejs.org/))
- ✅ PostgreSQL 14+ ([Descargar](https://www.postgresql.org/download/))
- ✅ Git

### 2. Clonar e instalar

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd el-tito-pizzeria-backend

# Instalar dependencias
npm install
```

### 3. Configurar PostgreSQL

```bash
# Acceder a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE el_tito_pizzeria;

# Salir
\q
```

### 4. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
# IMPORTANTE: Cambiar DB_PASSWORD por tu contraseña de PostgreSQL
```

### 5. Inicializar datos

```bash
# Ejecutar seeds (crea usuarios, mesas, productos)
npm run seed
```

### 6. Iniciar servidor

```bash
# Modo desarrollo
npm run start:dev
```

¡Listo! El servidor estará corriendo en `http://localhost:3000`

---

## 🧪 Probar la API

### Con cURL

```bash
# Login como admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eltito.com",
    "password": "Admin123!"
  }'

# Guardar el token que recibes
export TOKEN="tu_token_aqui"

# Obtener menú (público)
curl http://localhost:3000/api/products/menu

# Obtener mesas (requiere auth)
curl http://localhost:3000/api/tables \
  -H "Authorization: Bearer $TOKEN"
```

### Con Postman

1. Importa esta colección base:
   - URL base: `http://localhost:3000/api`
   - Añade header: `Authorization: Bearer {{token}}`

2. Endpoints para probar:
   - `POST /auth/login` - Login
   - `GET /products/menu` - Ver menú
   - `GET /tables` - Ver mesas
   - `POST /orders/from-qr` - Crear pedido desde QR

---

## 🔐 Credenciales de Prueba

Después de ejecutar `npm run seed`:

### 👨‍💼 Administrador
```
Email: admin@eltito.com
Password: Admin123!
```

### 👨‍🍳 Jefe de Cocina
```
Email: cocina@eltito.com
Password: Cocina123!
```

### 👨‍🍳 Camarero
```
Email: camarero1@eltito.com
Password: Camarero123!
```

---

## 📱 Flujo de Uso Básico

### 1. Generar QRs para mesas

```bash
# Login como admin
POST /api/auth/login
{
  "email": "admin@eltito.com",
  "password": "Admin123!"
}

# Generar QRs para todas las mesas
POST /api/qr-codes/generate/all
Headers: { Authorization: Bearer TOKEN }
```

### 2. Cliente escanea QR y hace pedido

```bash
# El QR contiene un código único
# Cliente valida el QR (público)
GET /api/qr-codes/validate/CODIGO_QR

# Cliente crea pedido (público)
POST /api/orders/from-qr
{
  "qrCode": "CODIGO_QR",
  "items": [
    {
      "productId": "uuid-producto",
      "quantity": 2,
      "notes": "Sin cebolla"
    }
  ],
  "customerName": "Juan",
  "notes": "Para llevar"
}
```

### 3. Cocina recibe y procesa

```bash
# Login como cocina
POST /api/auth/login
{
  "email": "cocina@eltito.com",
  "password": "Cocina123!"
}

# Ver pedidos activos
GET /api/orders/active

# Iniciar preparación
POST /api/orders/{orderId}/start-preparing

# Marcar como listo
POST /api/orders/{orderId}/ready
```

### 4. Camarero entrega

```bash
# Login como camarero
POST /api/auth/login

# Ver pedidos listos
GET /api/orders?status=ready

# Marcar como entregado
POST /api/orders/{orderId}/delivered
```

---

## 🔌 Probar WebSockets

```html
<!-- test-websocket.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Test WebSocket</title>
  <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
</head>
<body>
  <h1>Test WebSocket</h1>
  <div id="messages"></div>

  <script>
    const socket = io('http://localhost:3000/orders');
    
    socket.on('connect', () => {
      console.log('Conectado!');
      
      // Suscribirse a cocina
      socket.emit('subscribe', { room: 'kitchen' });
    });
    
    socket.on('order:new', (data) => {
      const div = document.getElementById('messages');
      div.innerHTML += `<p>Nuevo pedido: ${data.order.orderNumber}</p>`;
      console.log('Nuevo pedido:', data);
    });
    
    socket.on('order:updated', (data) => {
      const div = document.getElementById('messages');
      div.innerHTML += `<p>Pedido actualizado: ${data.order.orderNumber}</p>`;
      console.log('Actualizado:', data);
    });
  </script>
</body>
</html>
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Comprueba las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Error: "Port 3000 is already in use"
- Cambia el puerto en `.env`: `PORT=3001`
- O mata el proceso: `lsof -ti:3000 | xargs kill -9`

### Error: "JWT secret not configured"
- Revisa que `.env` tenga `JWT_SECRET`
- Reinicia el servidor después de editar `.env`

### Seeds no funcionan
```bash
# Borrar base de datos y recrear
psql -U postgres
DROP DATABASE el_tito_pizzeria;
CREATE DATABASE el_tito_pizzeria;
\q

# Ejecutar seeds de nuevo
npm run seed
```

---

## 📚 Siguiente Paso

Lee el [README.md](./README.md) completo para:
- Documentación detallada de endpoints
- Guía de arquitectura
- Best practices
- Despliegue en producción

---

## 💡 Tips

1. **Usa Postman/Insomnia**: Guarda colecciones para no escribir cURL
2. **Activa logs**: Cambia `NODE_ENV=development` para ver más detalles
3. **WebSocket test**: Usa el HTML de arriba para ver notificaciones en tiempo real
4. **Renovar QRs**: Ejecuta `POST /qr-codes/renew/all` cada mes

¡Disfruta desarrollando! 🚀