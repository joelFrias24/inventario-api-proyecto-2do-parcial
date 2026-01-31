/**
 * Middleware centralizado para manejo de errores
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Error de validación de SQLite
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      error: 'Error de validación de base de datos',
      message: 'Los datos proporcionados violan las restricciones de la base de datos'
    });
  }

  // Error de base de datos
  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      error: 'Error de base de datos',
      message: 'Ocurrió un error al procesar la solicitud'
    });
  }

  // Error de validación (ya manejado por express-validator, pero por si acaso)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message
    });
  }

  // Error 404 - No encontrado (se maneja en las rutas, pero por si acaso)
  if (err.status === 404) {
    return res.status(404).json({
      error: 'No encontrado',
      message: err.message || 'Recurso no encontrado'
    });
  }

  // Error genérico del servidor
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Middleware para manejar rutas no encontradas (404)
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.path} no existe`,
    availableRoutes: [
      'GET /products',
      'GET /products/:id',
      'POST /products',
      'PUT /products/:id',
      'DELETE /products/:id',
      'GET /products/metrics'
    ]
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
