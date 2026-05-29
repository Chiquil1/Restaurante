// config/Db.js

const { Pool } = require('pg');
require('dotenv').config();

/**
 * Pool de conexiones PostgreSQL
 * Optimizado para desarrollo y producción
 */

const pool = new Pool({
    host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.POSTGRES_DB || process.env.DB_NAME || 'Restaurante',

    // Configuración del pool
    max: 20, // Máximo de conexiones
    min: 2,  // Mínimo de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,

    // SSL opcional para producción
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});

/**
 * Evento: conexión exitosa
 */
pool.on('connect', () => {
    console.log('✅ PostgreSQL conectado correctamente');
});

/**
 * Evento: error inesperado
 */
pool.on('error', (err) => {
    console.error('❌ Error inesperado en PostgreSQL:', err.message);
});

/**
 * Función para probar conexión
 */
const testConnection = async () => {
    try {
        const client = await pool.connect();

        const result = await client.query('SELECT NOW()');

        console.log('📦 Base de datos conectada');
        console.log('🕒 Hora servidor DB:', result.rows[0].now);

        client.release();

        return true;
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL');
        console.error(error.message);

        return false;
    }
};

/**
 * Helper para queries rápidas
 */
const query = async (text, params) => {
    const start = Date.now();

    try {
        const res = await pool.query(text, params);

        const duration = Date.now() - start;

        if (process.env.NODE_ENV === 'development') {
            console.log('📄 Query ejecutada:', {
                duration: `${duration}ms`,
                rows: res.rowCount
            });
        }

        return res;
    } catch (error) {
        console.error('❌ Error SQL:', error.message);

        console.error('📄 Query:', text);

        throw error;
    }
};

/**
 * Exportaciones
 */
module.exports = {
    pool,
    query,
    connect: () => pool.connect(),
    end: () => pool.end(),
    closeGracefully: () => pool.end(),
    testConnection
};
