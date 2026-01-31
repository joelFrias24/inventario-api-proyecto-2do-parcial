const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Establecer modo test ANTES de importar cualquier módulo
process.env.NODE_ENV = 'test';

const { initDatabase, getDatabase, closeDatabase, DB_PATH } = require('../src/database/db');
let app;

// Configurar base de datos de prueba antes de todas las pruebas
beforeAll(async () => {
  // Si existe la base de datos de prueba, eliminarla
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
  
  // Inicializar la base de datos de prueba
  await initDatabase();
  
  // Importar app DESPUÉS de inicializar la base de datos
  app = require('../src/app');
});

// Limpiar base de datos después de cada prueba
afterEach(async () => {
  const db = getDatabase();
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM products', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

// Cerrar conexión después de todas las pruebas
afterAll(async () => {
  await closeDatabase();
  // Eliminar base de datos de prueba si existe
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
  delete process.env.NODE_ENV;
});

describe('API REST de Inventario de Productos', () => {
  describe('GET /products', () => {
    test('Debería retornar lista vacía cuando no hay productos', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    test('Debería retornar productos con paginación', async () => {
      // Crear algunos productos de prueba
      const db = getDatabase();
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', ['Producto 1', 10.5, 20], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', ['Producto 2', 15.0, 30], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const response = await request(app)
        .get('/products?page=1&limit=1')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    test('Debería filtrar productos por búsqueda', async () => {
      const db = getDatabase();
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', ['Laptop', 1000, 5], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', ['Mouse', 25, 50], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const response = await request(app)
        .get('/products?search=Laptop')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Laptop');
    });

    test('Debería filtrar productos por rango de precio', async () => {
      const db = getDatabase();
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', ['Producto 1', 10, 20], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', ['Producto 2', 50, 30], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', ['Producto 3', 100, 40], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const response = await request(app)
        .get('/products?minPrice=20&maxPrice=60')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].price).toBe(50);
    });

    test('Debería validar query params inválidos', async () => {
      const response = await request(app)
        .get('/products?page=-1')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /products/:id', () => {
    test('Debería retornar un producto por ID', async () => {
      const db = getDatabase();
      let productId;
      await new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
        stmt.run(['Producto Test', 99.99, 10], function(err) {
          if (err) reject(err);
          else {
            productId = this.lastID;
            stmt.finalize();
            resolve();
          }
        });
      });

      const response = await request(app)
        .get(`/products/${productId}`)
        .expect(200);

      expect(response.body.id).toBe(productId);
      expect(response.body.name).toBe('Producto Test');
      expect(response.body.price).toBe(99.99);
      expect(response.body.stock).toBe(10);
    });

    test('Debería retornar 404 si el producto no existe', async () => {
      const response = await request(app)
        .get('/products/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Producto no encontrado');
    });
  });

  describe('POST /products', () => {
    test('Debería crear un nuevo producto', async () => {
      const newProduct = {
        name: 'Nuevo Producto',
        price: 29.99,
        stock: 15
      };

      const response = await request(app)
        .post('/products')
        .send(newProduct)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newProduct.name);
      expect(response.body.price).toBe(newProduct.price);
      expect(response.body.stock).toBe(newProduct.stock);
    });

    test('Debería validar datos requeridos', async () => {
      const response = await request(app)
        .post('/products')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Debería validar que el precio sea positivo', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          name: 'Producto',
          price: -10,
          stock: 5
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Debería validar que el stock sea un entero positivo', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          name: 'Producto',
          price: 10,
          stock: -5
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /products/:id', () => {
    test('Debería actualizar un producto existente', async () => {
      const db = getDatabase();
      let productId;
      await new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
        stmt.run(['Producto Original', 50, 20], function(err) {
          if (err) reject(err);
          else {
            productId = this.lastID;
            stmt.finalize();
            resolve();
          }
        });
      });

      const updatedData = {
        name: 'Producto Actualizado',
        price: 75.5,
        stock: 30
      };

      const response = await request(app)
        .put(`/products/${productId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.price).toBe(updatedData.price);
      expect(response.body.stock).toBe(updatedData.stock);
    });

    test('Debería actualizar parcialmente un producto', async () => {
      const db = getDatabase();
      let productId;
      await new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
        stmt.run(['Producto', 50, 20], function(err) {
          if (err) reject(err);
          else {
            productId = this.lastID;
            stmt.finalize();
            resolve();
          }
        });
      });

      const response = await request(app)
        .put(`/products/${productId}`)
        .send({ price: 100 })
        .expect(200);

      expect(response.body.price).toBe(100);
      expect(response.body.name).toBe('Producto'); // No cambió
    });

    test('Debería retornar 404 si el producto no existe', async () => {
      const response = await request(app)
        .put('/products/99999')
        .send({ name: 'Test' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /products/:id', () => {
    test('Debería eliminar un producto existente', async () => {
      const db = getDatabase();
      let productId;
      await new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
        stmt.run(['Producto a Eliminar', 25, 10], function(err) {
          if (err) reject(err);
          else {
            productId = this.lastID;
            stmt.finalize();
            resolve();
          }
        });
      });

      const response = await request(app)
        .delete(`/products/${productId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.id).toBe(productId);

      // Verificar que el producto fue eliminado
      const getResponse = await request(app)
        .get(`/products/${productId}`)
        .expect(404);
    });

    test('Debería retornar 404 si el producto no existe', async () => {
      const response = await request(app)
        .delete('/products/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /products/metrics', () => {
    test('Debería retornar métricas del inventario', async () => {
      const db = getDatabase();
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', ['Producto 1', 10, 20], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', ['Producto 2', 20, 5], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const response = await request(app)
        .get('/products/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('totalProducts');
      expect(response.body).toHaveProperty('totalInventoryValue');
      expect(response.body).toHaveProperty('averagePrice');
      expect(response.body).toHaveProperty('minPrice');
      expect(response.body).toHaveProperty('maxPrice');
      expect(response.body).toHaveProperty('lowStockProducts');
      expect(response.body).toHaveProperty('totalStock');
      expect(response.body).toHaveProperty('lowStockItems');
      expect(response.body).toHaveProperty('mostExpensive');
      expect(response.body).toHaveProperty('cheapest');
      expect(response.body.totalProducts).toBe(2);
    });

    test('Debería retornar métricas vacías cuando no hay productos', async () => {
      const response = await request(app)
        .get('/products/metrics')
        .expect(200);

      expect(response.body.totalProducts).toBe(0);
      expect(response.body.totalInventoryValue).toBe(0);
    });
  });

  describe('GET /health', () => {
    test('Debería retornar estado de salud', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });
});
