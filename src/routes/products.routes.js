const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateQueryParams
} = require('../middleware/validator');

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar productos con paginación, búsqueda y filtros
 *     description: Obtiene una lista paginada de productos con opciones de búsqueda y filtrado por precio y stock
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de items por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 255
 *         description: Búsqueda por nombre (búsqueda parcial)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio máximo
 *       - in: query
 *         name: minStock
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Stock mínimo
 *       - in: query
 *         name: maxStock
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Stock máximo
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsList'
 *       400:
 *         description: Error de validación en los parámetros
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  validateQueryParams,
  productsController.getAllProducts
);

/**
 * @swagger
 * /products/metrics:
 *   get:
 *     summary: Obtener métricas del inventario
 *     description: Retorna estadísticas completas del inventario incluyendo total de productos, valor total, productos con stock bajo, etc.
 *     tags: [Métricas]
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Metrics'
 */
router.get('/metrics', productsController.getMetrics);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     description: Obtiene los detalles de un producto específico por su ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', productsController.getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear un nuevo producto
 *     description: Crea un nuevo producto en el inventario
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           example:
 *             name: Laptop Dell
 *             price: 899.99
 *             stock: 15
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  validateCreateProduct,
  productsController.createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar un producto existente
 *     description: Actualiza los datos de un producto. Todos los campos son opcionales.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *           example:
 *             name: Laptop Dell Actualizada
 *             price: 799.99
 *             stock: 20
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id',
  validateUpdateProduct,
  productsController.updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     description: Elimina un producto del inventario por su ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Producto eliminado exitosamente
 *                 id:
 *                   type: integer
 *                   example: 1
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
