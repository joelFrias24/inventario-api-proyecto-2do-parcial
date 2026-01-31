const productModel = require('../models/product.model');

/**
 * Obtiene todos los productos con paginación, búsqueda y filtros
 */
async function getAllProducts(req, res, next) {
  try {
    const {
      page,
      limit,
      search,
      minPrice,
      maxPrice,
      minStock,
      maxStock
    } = req.query;

    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minStock: minStock ? parseInt(minStock) : undefined,
      maxStock: maxStock ? parseInt(maxStock) : undefined
    };

    const result = await productModel.getAllProducts(options);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene un producto por ID
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(parseInt(id));

    if (!product) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        message: `No existe un producto con ID ${id}`
      });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

/**
 * Crea un nuevo producto
 */
async function createProduct(req, res, next) {
  try {
    const { name, price, stock } = req.body;
    const product = await productModel.createProduct({ name, price, stock });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

/**
 * Actualiza un producto existente
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;

    const product = await productModel.updateProduct(parseInt(id), {
      name,
      price,
      stock
    });

    if (!product) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        message: `No existe un producto con ID ${id}`
      });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

/**
 * Elimina un producto
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await productModel.deleteProduct(parseInt(id));

    if (!deleted) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        message: `No existe un producto con ID ${id}`
      });
    }

    res.status(200).json({
      message: 'Producto eliminado exitosamente',
      id: parseInt(id)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene métricas del inventario
 */
async function getMetrics(req, res, next) {
  try {
    const metrics = await productModel.getMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMetrics
};
