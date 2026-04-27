const { Pool } = require('pg');

// Configuración de la conexión
const pool = new Pool({
  user: 'postgres',           // Tu usuario
  host: 'localhost',           // El servidor (local en este caso)
  database: 'Restaurante',     // El nombre de tu base de datos
  password: 'postgres',       // Tu contraseña
  port: 5432,                 // Puerto por defecto de PostgreSQL
});

// Función para probar la conexión y exportar el pool
pool.on('connect', () => {
  console.log('✅ Conectado exitosamente a la base de datos "Restaurante"');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la conexión:', err);
  process.exit(-1);
});

module.exports = pool;
