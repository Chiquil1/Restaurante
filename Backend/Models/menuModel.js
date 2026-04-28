const pool = require('../config/Db');

exports.getAllMenu = async () => {
    const result = await pool.query('SELECT * FROM menu ORDER BY categoria, nombre');
    return result.rows;
};

exports.getMenuById = async (id) => {
    const result = await pool.query('SELECT * FROM menu WHERE id = $1', [id]);
    return result.rows[0];
};

exports.createMenuItem = async (item) => {
    const { nombre, descripcion, categoria, precio, ingredientes, tiempo_preparacion, disponible } = item;
    const result = await pool.query(
        `INSERT INTO menu (nombre, descripcion, categoria, precio, ingredientes, tiempo_preparacion, disponible)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [nombre, descripcion, categoria, precio, ingredientes, tiempo_preparacion, disponible !== undefined ? disponible : true]
    );
    return result.rows[0];
};

exports.updateMenuItem = async (id, item) => {
    const { nombre, descripcion, categoria, precio, ingredientes, tiempo_preparacion, disponible } = item;
    const result = await pool.query(
        `UPDATE menu SET
            nombre=$1, descripcion=$2, categoria=$3, precio=$4, ingredientes=$5, tiempo_preparacion=$6, disponible=$7
        WHERE id=$8 RETURNING *`,
        [nombre, descripcion, categoria, precio, ingredientes, tiempo_preparacion, disponible, id]
    );
    return result.rows[0];
};

exports.deleteMenuItem = async (id) => {
    await pool.query('DELETE FROM menu WHERE id = $1', [id]);
    return { message: 'Producto eliminado' };
};

exports.getMenuByCategory = async (categoria) => {
    const result = await pool.query('SELECT * FROM menu WHERE categoria = $1 AND disponible = true ORDER BY nombre', [categoria]);
    return result.rows;
};

exports.getAvailableMenu = async () => {
    const result = await pool.query('SELECT * FROM menu WHERE disponible = true ORDER BY categoria, nombre');
    return result.rows;
};
// Agregar esto a menuModel.js
exports.getCategories = async () => {
    const result = await pool.query('SELECT DISTINCT categoria FROM menu WHERE categoria IS NOT NULL ORDER BY categoria');
    return result.rows.map(row => row.categoria); // Retorna un array simple: ['Bebidas', 'Platos Fuertes', ...]
};
