const { body, query, validationResult } = require('express-validator');

/**
 * Middleware para validar los resultados de la validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Error de validación',
      details: errors.array()
    });
  }
  next();
};

/**
 * Validaciones para crear un producto
 */
const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre debe tener entre 1 y 255 caracteres'),
  body('price')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('stock')
    .notEmpty()
    .withMessage('El stock es requerido')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero positivo'),
  handleValidationErrors
];

/**
 * Validaciones para actualizar un producto
 */
const validateUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre debe tener entre 1 y 255 caracteres'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero positivo'),
  handleValidationErrors
];

/**
 * Validaciones para query parameters de búsqueda y paginación
 */
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La búsqueda no puede exceder 255 caracteres'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio mínimo debe ser un número positivo'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio máximo debe ser un número positivo'),
  query('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock mínimo debe ser un número entero positivo'),
  query('maxStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock máximo debe ser un número entero positivo'),
  handleValidationErrors
];

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateQueryParams,
  handleValidationErrors
};
