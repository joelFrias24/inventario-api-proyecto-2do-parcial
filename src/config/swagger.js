const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API REST de Inventario de Productos',
      version: '1.0.0',
      description: 'API REST completa para gestión de inventario de productos desarrollada con Node.js, Express y SQLite.',
      contact: {
        name: 'Soporte API',
        email: 'support@example.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.example.com',
        description: 'Servidor de producción'
      }
    ],
    tags: [
      {
        name: 'Productos',
        description: 'Endpoints para gestión de productos'
      },
      {
        name: 'Métricas',
        description: 'Endpoints para obtener estadísticas del inventario'
      },
      {
        name: 'Health',
        description: 'Endpoints de estado del sistema'
      }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'price', 'stock'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del producto',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
              minLength: 1,
              maxLength: 255,
              example: 'Laptop Dell'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Precio del producto',
              minimum: 0,
              example: 899.99
            },
            stock: {
              type: 'integer',
              description: 'Cantidad en stock',
              minimum: 0,
              example: 15
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
              example: '2024-01-15T10:30:00.000Z'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'price', 'stock'],
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del producto',
              minLength: 1,
              maxLength: 255,
              example: 'Laptop Dell'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Precio del producto',
              minimum: 0,
              example: 899.99
            },
            stock: {
              type: 'integer',
              description: 'Cantidad en stock',
              minimum: 0,
              example: 15
            }
          }
        },
        ProductUpdate: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del producto',
              minLength: 1,
              maxLength: 255,
              example: 'Laptop Dell Actualizada'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Precio del producto',
              minimum: 0,
              example: 799.99
            },
            stock: {
              type: 'integer',
              description: 'Cantidad en stock',
              minimum: 0,
              example: 20
            }
          }
        },
        ProductsList: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1
                },
                limit: {
                  type: 'integer',
                  example: 10
                },
                total: {
                  type: 'integer',
                  example: 50
                },
                totalPages: {
                  type: 'integer',
                  example: 5
                }
              }
            }
          }
        },
        Metrics: {
          type: 'object',
          properties: {
            totalProducts: {
              type: 'integer',
              description: 'Total de productos en el inventario',
              example: 50
            },
            totalInventoryValue: {
              type: 'number',
              description: 'Valor total del inventario (suma de precio × stock)',
              example: 125000.50
            },
            averagePrice: {
              type: 'number',
              description: 'Precio promedio de los productos',
              example: 2500.01
            },
            minPrice: {
              type: 'number',
              description: 'Precio mínimo',
              example: 10.99
            },
            maxPrice: {
              type: 'number',
              description: 'Precio máximo',
              example: 5000.00
            },
            lowStockProducts: {
              type: 'integer',
              description: 'Cantidad de productos con stock bajo (< 10)',
              example: 5
            },
            totalStock: {
              type: 'integer',
              description: 'Total de unidades en stock',
              example: 500
            },
            lowStockItems: {
              type: 'array',
              description: 'Lista de productos con stock bajo',
              items: {
                $ref: '#/components/schemas/Product'
              }
            },
            mostExpensive: {
              type: 'array',
              description: 'Productos más caros (top 5)',
              items: {
                $ref: '#/components/schemas/Product'
              }
            },
            cheapest: {
              type: 'array',
              description: 'Productos más baratos (top 5)',
              items: {
                $ref: '#/components/schemas/Product'
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Tipo de error',
              example: 'Error de validación'
            },
            message: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'El nombre es requerido'
            },
            details: {
              type: 'array',
              description: 'Detalles del error (solo en errores de validación)',
              items: {
                type: 'object'
              }
            }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            message: {
              type: 'string',
              example: 'API funcionando correctamente'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/app.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
