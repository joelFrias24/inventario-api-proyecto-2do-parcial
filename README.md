# API REST de Inventario de Productos

API REST completa para gestión de inventario de productos desarrollada con Node.js, Express y SQLite.

## Características

- ✅ CRUD completo de productos
- ✅ Búsqueda y filtros avanzados
- ✅ Paginación
- ✅ Métricas del inventario
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Documentación interactiva con Swagger UI
- ✅ Pruebas unitarias con Jest y Supertest
- ✅ Dockerizado
- ✅ CI/CD con GitHub Actions

## Estructura del Proyecto

```
Proyecto-2do-parcial/
├── src/
│   ├── routes/           # Definición de rutas
│   ├── controllers/      # Lógica de negocio
│   ├── models/           # Acceso a base de datos
│   ├── middleware/       # Middlewares (validación, errores)
│   ├── database/         # Configuración de SQLite
│   ├── config/           # Configuración (Swagger)
│   └── app.js            # Configuración de Express
├── tests/                # Pruebas unitarias
├── .github/workflows/    # Pipeline CI/CD
├── Dockerfile
├── package.json
└── server.js            # Punto de entrada
```

## Requisitos Previos

- Node.js 18.x o superior
- npm o yarn
- Docker (opcional, para ejecutar con contenedores)

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd Proyecto-2do-parcial
```

2. Instalar dependencias:
```bash
npm install
```

## Ejecución Local

### Modo Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000` con recarga automática.

### Modo Producción

```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`.

## Documentación Interactiva (Swagger UI)

La API incluye documentación interactiva con Swagger UI. Una vez que el servidor esté corriendo, puedes acceder a la documentación en:

**http://localhost:3000/api-docs**

Desde Swagger UI puedes:
- Ver todos los endpoints disponibles
- Ver los esquemas de datos
- Probar los endpoints directamente desde el navegador
- Ver ejemplos de requests y responses

## Endpoints de la API

### CRUD de Productos

#### Listar productos (con paginación, búsqueda y filtros)
```http
GET /products
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 10, máximo: 100)
- `search` (opcional): Búsqueda por nombre (búsqueda parcial)
- `minPrice` (opcional): Precio mínimo
- `maxPrice` (opcional): Precio máximo
- `minStock` (opcional): Stock mínimo
- `maxStock` (opcional): Stock máximo

**Ejemplo:**
```bash
GET /products?page=1&limit=10&search=laptop&minPrice=100&maxPrice=1000
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Laptop Dell",
      "price": 899.99,
      "stock": 15,
      "created_at": "2024-01-15 10:30:00",
      "updated_at": "2024-01-15 10:30:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Obtener producto por ID
```http
GET /products/:id
```

**Ejemplo:**
```bash
GET /products/1
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Laptop Dell",
  "price": 899.99,
  "stock": 15,
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-15 10:30:00"
}
```

#### Crear producto
```http
POST /products
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Laptop Dell",
  "price": 899.99,
  "stock": 15
}
```

**Respuesta (201):**
```json
{
  "id": 1,
  "name": "Laptop Dell",
  "price": 899.99,
  "stock": 15,
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-15 10:30:00"
}
```

#### Actualizar producto
```http
PUT /products/:id
Content-Type: application/json
```

**Body (todos los campos son opcionales):**
```json
{
  "name": "Laptop Dell Actualizada",
  "price": 799.99,
  "stock": 20
}
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Laptop Dell Actualizada",
  "price": 799.99,
  "stock": 20,
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-15 11:45:00"
}
```

#### Eliminar producto
```http
DELETE /products/:id
```

**Respuesta:**
```json
{
  "message": "Producto eliminado exitosamente",
  "id": 1
}
```

### Métricas

#### Obtener métricas del inventario
```http
GET /products/metrics
```

**Respuesta:**
```json
{
  "totalProducts": 50,
  "totalInventoryValue": 125000.50,
  "averagePrice": 2500.01,
  "minPrice": 10.99,
  "maxPrice": 5000.00,
  "lowStockProducts": 5,
  "totalStock": 500,
  "lowStockItems": [
    {
      "id": 1,
      "name": "Producto A",
      "price": 25.99,
      "stock": 3
    }
  ],
  "mostExpensive": [
    {
      "id": 50,
      "name": "Producto Premium",
      "price": 5000.00,
      "stock": 2
    }
  ],
  "cheapest": [
    {
      "id": 1,
      "name": "Producto Básico",
      "price": 10.99,
      "stock": 100
    }
  ]
}
```

### Health Check

```http
GET /health
```

**Respuesta:**
```json
{
  "status": "OK",
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error de validación o datos inválidos
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

## Validaciones

### Crear Producto
- `name`: Requerido, entre 1 y 255 caracteres
- `price`: Requerido, número positivo (float)
- `stock`: Requerido, número entero positivo

### Actualizar Producto
- Todos los campos son opcionales
- Si se proporcionan, deben cumplir las mismas validaciones que al crear

### Query Parameters
- `page`: Entero mayor a 0
- `limit`: Entero entre 1 y 100
- `search`: Máximo 255 caracteres
- `minPrice`, `maxPrice`: Números positivos
- `minStock`, `maxStock`: Enteros positivos

## Pruebas

Ejecutar todas las pruebas:
```bash
npm test
```

Ejecutar pruebas en modo watch:
```bash
npm run test:watch
```

Las pruebas cubren:
- ✅ CRUD completo
- ✅ Búsqueda y filtros
- ✅ Paginación
- ✅ Validaciones
- ✅ Manejo de errores
- ✅ Métricas

## Docker

### Construir imagen localmente
```bash
docker build -t inventory-api .
```

### Ejecutar contenedor
```bash
docker run -p 3000:3000 inventory-api
```

### Ejecutar con volumen para persistencia
```bash
docker run -p 3000:3000 -v $(pwd)/data:/app/data inventory-api
```

### Usar imagen desde GitHub Container Registry (GHCR)

Las imágenes Docker se publican automáticamente en GitHub Container Registry después de cada push exitoso.

**Autenticarse en GHCR:**
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

**Ejecutar imagen desde GHCR:**
```bash
# Usar la imagen latest (rama main/master)
docker run -p 3000:3000 ghcr.io/USERNAME/inventory-api:latest

# Usar una imagen específica por SHA
docker run -p 3000:3000 ghcr.io/USERNAME/inventory-api:main-abc1234

# Usar una imagen de una rama específica
docker run -p 3000:3000 ghcr.io/USERNAME/inventory-api:develop
```

**Nota:** Reemplaza `USERNAME` con tu nombre de usuario de GitHub o el nombre de la organización.

## CI/CD

El proyecto incluye un pipeline de CI/CD con GitHub Actions que:

1. Ejecuta pruebas en múltiples versiones de Node.js (18.x, 20.x)
2. Valida que todas las pruebas pasen
3. Construye la imagen Docker
4. Publica automáticamente la imagen en GitHub Container Registry (GHCR)
   - Tag `latest` para ramas main/master
   - Tag con nombre de rama para otras ramas
   - Tag con SHA del commit para versiones específicas

El pipeline se ejecuta automáticamente en:
- Push a las ramas `main`, `master`, `develop`
- Pull requests a las ramas `main`, `master`, `develop`

## Base de Datos

La aplicación usa SQLite para almacenamiento. El archivo de base de datos (`inventory.db`) se crea automáticamente al iniciar la aplicación.

**Esquema de la tabla `products`:**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL
- `price`: REAL NOT NULL CHECK(price >= 0)
- `stock`: INTEGER NOT NULL CHECK(stock >= 0)
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

## Variables de Entorno

- `PORT`: Puerto del servidor (default: 3000)
- `NODE_ENV`: Entorno de ejecución (`development`, `production`, `test`)

## Ejemplos de Uso

### Crear un producto
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Dell",
    "price": 899.99,
    "stock": 15
  }'
```

### Listar productos con filtros
```bash
curl "http://localhost:3000/products?page=1&limit=10&minPrice=100&maxPrice=1000"
```

### Obtener métricas
```bash
curl http://localhost:3000/products/metrics
```

### Actualizar producto
```bash
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 799.99,
    "stock": 20
  }'
```

### Eliminar producto
```bash
curl -X DELETE http://localhost:3000/products/1
```

## Tecnologías Utilizadas

- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **SQLite3**: Base de datos
- **express-validator**: Validación de datos
- **Swagger UI / OpenAPI**: Documentación interactiva de la API
- **Jest**: Framework de pruebas
- **Supertest**: Testing de APIs HTTP
- **Docker**: Contenedorización

## Licencia

ISC

## Autor

Desarrollado como proyecto académico para Gestión de Configuración de Software.
