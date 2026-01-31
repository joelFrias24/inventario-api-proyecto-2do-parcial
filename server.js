const app = require('./src/app');
const { initDatabase } = require('./src/database/db');

const PORT = process.env.PORT || 3000;

// Inicializar base de datos y luego iniciar servidor
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`\n📚 Documentación Swagger UI disponible en:`);
      console.log(`   http://localhost:${PORT}/api-docs\n`);
      console.log(`Endpoints disponibles:`);
      console.log(`  GET    /products`);
      console.log(`  GET    /products/:id`);
      console.log(`  POST   /products`);
      console.log(`  PUT    /products/:id`);
      console.log(`  DELETE /products/:id`);
      console.log(`  GET    /products/metrics`);
      console.log(`  GET    /health`);
    });
  })
  .catch((error) => {
    console.error('Error al inicializar la aplicación:', error);
    process.exit(1);
  });

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\nCerrando servidor...');
  const { closeDatabase } = require('./src/database/db');
  closeDatabase()
    .then(() => {
      console.log('Servidor cerrado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error al cerrar la base de datos:', error);
      process.exit(1);
    });
});

process.on('SIGTERM', () => {
  console.log('\nCerrando servidor...');
  const { closeDatabase } = require('./src/database/db');
  closeDatabase()
    .then(() => {
      console.log('Servidor cerrado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error al cerrar la base de datos:', error);
      process.exit(1);
    });
});
