const { getDatabase } = require('../database/db');

/**
 * Obtiene todos los productos con paginación, búsqueda y filtros
 * @param {Object} options - Opciones de consulta
 * @param {number} options.page - Número de página (default: 1)
 * @param {number} options.limit - Items por página (default: 10)
 * @param {string} options.search - Búsqueda por nombre
 * @param {number} options.minPrice - Precio mínimo
 * @param {number} options.maxPrice - Precio máximo
 * @param {number} options.minStock - Stock mínimo
 * @param {number} options.maxStock - Stock máximo
 * @returns {Promise<Object>} Objeto con data y paginación
 */
function getAllProducts(options = {}) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const {
      page = 1,
      limit = 10,
      search,
      minPrice,
      maxPrice,
      minStock,
      maxStock
    } = options;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    // Construir condiciones WHERE dinámicamente
    if (search) {
      whereConditions.push('name LIKE ?');
      params.push(`%${search}%`);
    }
    if (minPrice !== undefined && minPrice !== null) {
      whereConditions.push('price >= ?');
      params.push(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      whereConditions.push('price <= ?');
      params.push(maxPrice);
    }
    if (minStock !== undefined && minStock !== null) {
      whereConditions.push('stock >= ?');
      params.push(minStock);
    }
    if (maxStock !== undefined && maxStock !== null) {
      whereConditions.push('stock <= ?');
      params.push(maxStock);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Consulta para obtener el total
    const countSql = `SELECT COUNT(*) as total FROM products ${whereClause}`;

    db.get(countSql, params, (err, countResult) => {
      if (err) {
        reject(err);
        return;
      }

      const total = countResult.total;
      const totalPages = Math.ceil(total / limit);

      // Consulta para obtener los productos
      const sql = `SELECT * FROM products ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;
      const queryParams = [...params, limit, offset];

      db.all(sql, queryParams, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            data: rows,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total,
              totalPages
            }
          });
        }
      });
    });
  });
}

/**
 * Obtiene un producto por ID
 * @param {number} id - ID del producto
 * @returns {Promise<Object|null>} Producto o null si no existe
 */
function getProductById(id) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const sql = 'SELECT * FROM products WHERE id = ?';

    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

/**
 * Crea un nuevo producto
 * @param {Object} product - Datos del producto
 * @param {string} product.name - Nombre del producto
 * @param {number} product.price - Precio del producto
 * @param {number} product.stock - Stock del producto
 * @returns {Promise<Object>} Producto creado con ID
 */
function createProduct(product) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const { name, price, stock } = product;
    const sql = `
      INSERT INTO products (name, price, stock)
      VALUES (?, ?, ?)
    `;

    db.run(sql, [name, price, stock], function(err) {
      if (err) {
        reject(err);
      } else {
        // Obtener el producto creado
        getProductById(this.lastID)
          .then(resolve)
          .catch(reject);
      }
    });
  });
}

/**
 * Actualiza un producto existente
 * @param {number} id - ID del producto
 * @param {Object} product - Datos a actualizar
 * @param {string} [product.name] - Nombre del producto
 * @param {number} [product.price] - Precio del producto
 * @param {number} [product.stock] - Stock del producto
 * @returns {Promise<Object|null>} Producto actualizado o null si no existe
 */
function updateProduct(id, product) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const { name, price, stock } = product;
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
    }
    if (stock !== undefined) {
      updates.push('stock = ?');
      params.push(stock);
    }

    if (updates.length === 0) {
      // No hay nada que actualizar
      getProductById(id).then(resolve).catch(reject);
      return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        resolve(null); // Producto no encontrado
      } else {
        getProductById(id).then(resolve).catch(reject);
      }
    });
  });
}

/**
 * Elimina un producto
 * @param {number} id - ID del producto
 * @returns {Promise<boolean>} true si se eliminó, false si no existía
 */
function deleteProduct(id) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const sql = 'DELETE FROM products WHERE id = ?';

    db.run(sql, [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes > 0);
      }
    });
  });
}

/**
 * Obtiene métricas del inventario
 * @returns {Promise<Object>} Objeto con estadísticas del inventario
 */
function getMetrics() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    const sql = `
      SELECT 
        COUNT(*) as totalProducts,
        SUM(price * stock) as totalInventoryValue,
        AVG(price) as averagePrice,
        MIN(price) as minPrice,
        MAX(price) as maxPrice,
        SUM(CASE WHEN stock < 10 THEN 1 ELSE 0 END) as lowStockProducts,
        SUM(stock) as totalStock
      FROM products
    `;

    db.get(sql, [], (err, row) => {
      if (err) {
        reject(err);
      } else {
        // Obtener productos con stock bajo
        const lowStockSql = 'SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC LIMIT 5';
        db.all(lowStockSql, [], (err, lowStockProducts) => {
          if (err) {
            reject(err);
          } else {
            // Obtener productos más caros
            const expensiveSql = 'SELECT * FROM products ORDER BY price DESC LIMIT 5';
            db.all(expensiveSql, [], (err, mostExpensive) => {
              if (err) {
                reject(err);
              } else {
                // Obtener productos más baratos
                const cheapSql = 'SELECT * FROM products ORDER BY price ASC LIMIT 5';
                db.all(cheapSql, [], (err, cheapest) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve({
                      totalProducts: row.totalProducts || 0,
                      totalInventoryValue: row.totalInventoryValue || 0,
                      averagePrice: row.averagePrice ? parseFloat(row.averagePrice.toFixed(2)) : 0,
                      minPrice: row.minPrice || 0,
                      maxPrice: row.maxPrice || 0,
                      lowStockProducts: row.lowStockProducts || 0,
                      totalStock: row.totalStock || 0,
                      lowStockItems: lowStockProducts || [],
                      mostExpensive: mostExpensive || [],
                      cheapest: cheapest || []
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMetrics
};
