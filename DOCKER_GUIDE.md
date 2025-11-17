# 🐳 Guía de Docker - El Tito Pizzería

## 📋 Requisitos Previos

- Docker Desktop instalado ([Descargar](https://www.docker.com/products/docker-desktop/))
- Docker Compose (viene incluido con Docker Desktop)
- 4GB de RAM disponible mínimo

## 🚀 Inicio Rápido

### Opción 1: Con Makefile (Recomendado)

```bash
# Ver todos los comandos disponibles
make help

# Construir e iniciar servicios
make build
make up

# Esperar 30 segundos y luego inicializar datos
make seed
```

### Opción 2: Con Docker Compose

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ejecutar seeds
chmod +x init-db.sh
./init-db.sh
```

### Opción 3: Desarrollo con Hot-Reload

```bash
# Usar docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up

# O con Makefile
make dev
```

## 📊 Servicios Disponibles

| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| Backend API | 3000 | http://localhost:3000/api | API REST + WebSockets |
| PostgreSQL | 5432 | localhost:5432 | Base de datos |
| Adminer | 8080 | http://localhost:8080 | Gestor visual de BD |

## 🔧 Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Ver estado
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Acceso a Contenedores

```bash
# Shell del backend
docker exec -it el-tito-backend sh

# Shell de PostgreSQL
docker exec -it el-tito-postgres psql -U postgres -d el_tito_pizzeria

# Ejecutar comando en el backend
docker exec el-tito-backend npm run seed
```

### Base de Datos

```bash
# Backup
docker exec el-tito-postgres pg_dump -U postgres el_tito_pizzeria > backup.sql

# Restaurar
docker exec -i el-tito-postgres psql -U postgres el_tito_pizzeria < backup.sql

# Conectar con psql
docker exec -it el-tito-postgres psql -U postgres
```

### Limpieza

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar también volúmenes (⚠️ borra datos de BD)
docker-compose down -v

# Limpiar imágenes no usadas
docker system prune -f

# Limpiar todo (incluyendo imágenes)
docker system prune -a
```

## 🔍 Adminer (Gestor de Base de Datos)

1. Acceder a http://localhost:8080
2. Datos de conexión:
   - **Sistema**: PostgreSQL
   - **Servidor**: postgres
   - **Usuario**: postgres
   - **Contraseña**: postgres123
   - **Base de datos**: el_tito_pizzeria

## 🐛 Solución de Problemas

### Error: "Cannot connect to the Docker daemon"

```bash
# Asegúrate de que Docker Desktop está corriendo
# En Mac/Windows: Abre Docker Desktop
# En Linux:
sudo systemctl start docker
```

### Error: "Port 3000 is already in use"

```bash
# Ver qué está usando el puerto
lsof -i :3000

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en docker-compose.yml
ports:
  - '3001:3000'  # Puerto 3001 en el host
```

### Error: "PostgreSQL is not ready"

```bash
# Esperar unos segundos más
# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar salud del contenedor
docker-compose ps
```

### Backend no se conecta a PostgreSQL

```bash
# Verificar que los servicios están en la misma red
docker network ls
docker network inspect el-tito-network

# Verificar variables de entorno
docker exec el-tito-backend env | grep DB_
```

### Contenedor se reinicia constantemente

```bash
# Ver logs completos
docker-compose logs backend

# Ver últimos errores
docker logs el-tito-backend --tail 50
```

## 🔄 Actualizar Código

### Sin reconstruir imagen (Desarrollo)

```bash
# Con docker-compose.dev.yml (hot-reload activo)
# Simplemente edita los archivos, se actualizan automáticamente
```

### Con reconstrucción (Producción)

```bash
# Detener servicios
docker-compose down

# Reconstruir imagen
docker-compose build backend

# Iniciar de nuevo
docker-compose up -d
```

## 📦 Variables de Entorno

### En Producción

Edita `docker-compose.yml`:

```yaml
environment:
  JWT_SECRET: "tu_secreto_super_seguro_aqui"
  FRONTEND_URL: "https://tu-dominio.com"
  NODE_ENV: production
```

### En Desarrollo

Edita `docker-compose.dev.yml` o crea un `.env`:

```bash
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=el_tito_pizzeria
JWT_SECRET=dev_secret
NODE_ENV=development
```

## 🚢 Despliegue en Producción

### 1. Preparar imagen

```bash
# Construir imagen optimizada
docker build -t el-tito-backend:latest .

# Probar localmente
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=tu_password \
  el-tito-backend:latest
```

### 2. Usar Docker Swarm (opcional)

```bash
# Inicializar swarm
docker swarm init

# Desplegar stack
docker stack deploy -c docker-compose.yml el-tito
```

### 3. Subir a Registry

```bash
# Tag para registry
docker tag el-tito-backend:latest tu-registry.com/el-tito-backend:latest

# Push
docker push tu-registry.com/el-tito-backend:latest
```

## 📊 Monitoreo

### Ver uso de recursos

```bash
# Recursos de todos los contenedores
docker stats

# Solo el backend
docker stats el-tito-backend
```

### Logs persistentes

```bash
# Guardar logs en archivo
docker-compose logs > logs.txt

# Logs con timestamp
docker-compose logs --timestamps > logs_$(date +%Y%m%d_%H%M%S).txt
```

## 🔐 Seguridad

### Cambiar contraseñas por defecto

En `docker-compose.yml`:

```yaml
environment:
  POSTGRES_PASSWORD: "usa_una_contraseña_segura"
  JWT_SECRET: "genera_un_secreto_aleatorio_largo"
```

### No exponer puertos innecesarios

```yaml
# Solo exponer lo necesario en producción
ports:
  - '3000:3000'  # API
  # - '5432:5432'  # ⚠️ No exponer PostgreSQL en producción
  # - '8080:8080'  # ⚠️ No exponer Adminer en producción
```

### Usar secrets (Swarm)

```yaml
secrets:
  db_password:
    external: true

services:
  postgres:
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
```

## 📝 Comandos con Makefile

```bash
make help           # Ver todos los comandos
make build          # Construir imágenes
make up             # Iniciar servicios
make down           # Detener servicios
make dev            # Modo desarrollo
make logs           # Ver logs
make logs-backend   # Logs del backend
make logs-db        # Logs de PostgreSQL
make seed           # Ejecutar seeds
make restart        # Reiniciar servicios
make clean          # Limpiar todo
make ps             # Estado de contenedores
make shell-backend  # Shell del backend
make shell-db       # Shell de PostgreSQL
make backup-db      # Backup de BD
make restore-db     # Restaurar BD
```

## ✅ Checklist de Producción

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Configurar JWT_SECRET seguro
- [ ] Configurar CORS con tu dominio
- [ ] No exponer puerto de PostgreSQL
- [ ] Eliminar Adminer en producción
- [ ] Configurar SSL/HTTPS
- [ ] Configurar logs persistentes
- [ ] Configurar backups automáticos
- [ ] Limitar recursos de contenedores
- [ ] Configurar health checks
- [ ] Usar volúmenes persistentes
- [ ] Configurar monitoreo

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el estado: `docker-compose ps`
3. Revisa la red: `docker network inspect el-tito-network`
4. Reinicia los servicios: `docker-compose restart`
5. Como último recurso: `make clean && make build && make up`