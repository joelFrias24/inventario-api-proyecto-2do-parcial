# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Copiar dependencias desde la etapa de construcción
COPY --from=builder /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Crear directorio para la base de datos
RUN mkdir -p /app/data

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
