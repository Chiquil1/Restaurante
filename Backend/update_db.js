const { Pool } = require('pg');
const fs = require('fs');

// Configuración de la base de datos (ajusta según tu configuración)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'restaurante',
  password: 'admin',
  port: 5432,
});

async function updateSchema() {
  try {
    console.log('🔄 Actualizando esquema de base de datos...');

    const sql = fs.readFileSync('update_schema.sql', 'utf8');

    // Ejecutar el SQL
    await pool.query(sql);

    console.log('✅ Esquema actualizado exitosamente');
    console.log('📋 Cambios aplicados:');
    console.log('  - Nueva tabla order_items');
    console.log('  - Nueva tabla mesa_pedidos');
    console.log('  - Triggers para sincronización automática');
    console.log('  - Índices para mejor rendimiento');

  } catch (err) {
    console.error('❌ Error actualizando esquema:', err.message);
  } finally {
    await pool.end();
  }
}

updateSchema();