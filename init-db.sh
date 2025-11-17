#!/bin/bash

# Script para inicializar la base de datos con Docker

echo "🔧 Esperando a que PostgreSQL esté listo..."

# Esperar a que PostgreSQL esté disponible
until docker exec el-tito-postgres pg_isready -U postgres > /dev/null 2>&1; do
  echo "⏳ Esperando PostgreSQL..."
  sleep 2
done

echo "✅ PostgreSQL está listo!"

echo "🌱 Ejecutando seeds..."

# Ejecutar seeds dentro del contenedor del backend
docker exec el-tito-backend npm run seed

echo "✅ Base de datos inicializada correctamente!"
echo ""
echo "📋 Credenciales de acceso:"
echo "   Admin: admin@eltito.com / Admin123!"
echo "   Cocina: cocina@eltito.com / Cocina123!"
echo "   Camarero: camarero1@eltito.com / Camarero123!"
echo ""
echo "🌐 Servicios disponibles:"
echo "   Backend API: http://localhost:3000/api"
echo "   Adminer (BD): http://localhost:8080"
echo ""