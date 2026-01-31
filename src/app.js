const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const productsRoutes = require('./routes/products.routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Inventario - Documentación'
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado de la API
 *     description: Endpoint para verificar que la API está funcionando correctamente
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/products', productsRoutes);

// 404 handler para rutas no encontradas
app.use(notFoundHandler);

// Error handler (debe ir al final)
app.use(errorHandler);

module.exports = app;
