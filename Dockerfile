# Etapa 1: Build
FROM node:18-alpine AS builder

# Instalar dependencias necesarias
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar aplicación
RUN npm run build

# Etapa 2: Production
FROM node:18-alpine

WORKDIR /app

# Copiar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Usuario no root por seguridad
USER node

# Comando de inicio
CMD ["node", "dist/main.js"]