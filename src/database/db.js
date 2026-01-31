const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Usar base de datos de prueba si estamos en modo test
const DB_PATH = process.env.NODE_ENV === 'test'
  ? path.join(__dirname, '../../test_inventory.db')
  : path.join(__dirname, '../../inventory.db');

let db = null;

/**
 * Inicializa la conexión a la base de datos SQLite
 * @returns {Promise<sqlite3.Database>}
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
        reject(err);
      } else {
        console.log('Conectado a la base de datos SQLite');
        createTable()
          .then(() => resolve(db))
          .catch(reject);
      }
    });
  });
}

/**
 * Crea la tabla de productos si no existe
 * @returns {Promise<void>}
 */
function createTable() {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL CHECK(price >= 0),
        stock INTEGER NOT NULL CHECK(stock >= 0),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(sql, (err) => {
      if (err) {
        console.error('Error al crear la tabla:', err.message);
        reject(err);
      } else {
        console.log('Tabla products creada o ya existe');
        resolve();
      }
    });
  });
}

/**
 * Obtiene la instancia de la base de datos
 * @returns {sqlite3.Database}
 */
function getDatabase() {
  if (!db) {
    throw new Error('Base de datos no inicializada. Llama a initDatabase() primero.');
  }
  return db;
}

/**
 * Cierra la conexión a la base de datos
 * @returns {Promise<void>}
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Conexión a la base de datos cerrada');
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  DB_PATH
};
