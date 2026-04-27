const pool = require("../config/Db");

class Menu {
  // Get all menu items
  static async getAllMenuItems(filters = {}) {
    try {
      let query = "SELECT * FROM menu WHERE disponible = true";
      const params = [];

      if (filters.categoria) {
        params.push(filters.categoria);
        query += ` AND categoria = $${params.length}`;
      }

      if (filters.search) {
        params.push(`%${filters.search}%`);
        query += ` AND nombre ILIKE $${params.length}`;
      }

      query += " ORDER BY categoria, nombre ASC";

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener menú: ${error.message}`);
    }
  }

  // Get categories
  static async getCategories() {
    try {
      const query = "SELECT DISTINCT categoria FROM menu ORDER BY categoria ASC;";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }
  }

  // Create menu item
 // DENTRO de menuModel.js -> Cambia el método createMenuItem
static async createMenuItem(data) {
  try {
    const { nombre, descripcion, categoria, precio, ingredientes, tiempoPreparacion, disponible } = data;

    // CAMBIO: Usamos CURRENT_TIMESTAMP y corregimos el nombre de la columna tiempo_preparacion
    const query = `
      INSERT INTO menu (nombre, descripcion, categoria, precio, ingredientes, tiempo_preparacion, disponible, fecha_creacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      nombre, 
      descripcion, 
      categoria, 
      precio, 
      ingredientes, 
      tiempoPreparacion, 
      disponible !== undefined ? disponible : true
    ]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear plato: ${error.message}`);
  }
}

  // Update menu item
  static async updateMenuItem(id, data) {
    try {
      const allowedFields = ["nombre", "descripcion", "categoria", "precio", "ingredientes", "tiempoPreparacion", "disponible"];
      const updates = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(data)) {
        if (allowedFields.includes(key) && value !== undefined) {
          const dbField = key
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase();
          updates.push(`${dbField} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }

      if (updates.length === 0) {
        throw new Error("No valid fields to update");
      }

      values.push(id);
      const query = `UPDATE menu SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *;`;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar plato: ${error.message}`);
    }
  }

  // Delete menu item
  static async deleteMenuItem(id) {
    try {
      const query = "DELETE FROM menu WHERE id = $1 RETURNING *;";
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar plato: ${error.message}`);
    }
  }
}

module.exports = Menu;
