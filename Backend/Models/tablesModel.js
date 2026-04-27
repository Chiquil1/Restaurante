const pool = require("../config/Db");

class Tables {
  /**
   * Obtiene todas las mesas con la información expandida.
   * He renombrado los alias para que el Frontend los reconozca más fácilmente.
   */
  static async getMesas() {
    try {
      const query = `
        SELECT 
          m.*, 
          p.nombre as mesero, 
          r.nombre_cliente as cliente 
        FROM mesas m
        LEFT JOIN personal p ON m.mesero_id = p.id
        LEFT JOIN reservations r ON m.reserva_id = r.id
        ORDER BY m.piso, m.numero
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener mesas: ${error.message}`, { cause: error });
    }
  }

  static async getMeseros() {
    try {
      const query = `SELECT id, nombre FROM personal WHERE puesto = 'Mesero' OR puesto = 'Waiter'`;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener meseros: ${error.message}`, { cause: error });
    }
  }

  static async createMesa(data) {
    try {
      const { numero, capacidad, piso, ubicacion, estado, reserva_id, mesero_id } = data;
      const query = `
        INSERT INTO mesas (numero, capacidad, piso, ubicacion, estado, reserva_id, mesero_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const { rows } = await pool.query(query, [numero, capacidad, piso, ubicacion, estado, reserva_id, mesero_id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al crear mesa: ${error.message}`, { cause: error });
    }
  }

  static async updateMesa(id, data) {
    try {
      const { estado, cliente, total, mesero_id, reserva_id, posicion_x, posicion_y } = data;
      const query = `
        UPDATE mesas 
        SET estado = COALESCE($1, estado), 
            cliente = COALESCE($2, cliente), 
            total = COALESCE($3, total), 
            mesero_id = COALESCE($4, mesero_id), 
            reserva_id = COALESCE($5, reserva_id),
            posicion_x = COALESCE($6, posicion_x),
            posicion_y = COALESCE($7, posicion_y)
        WHERE id = $8 
        RETURNING *
      `;
      const { rows } = await pool.query(query, [estado, cliente, total, mesero_id, reserva_id, posicion_x, posicion_y, id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar mesa: ${error.message}`, { cause: error });
    }
  }

  static async deleteMesa(id) {
    try {
      await pool.query('DELETE FROM mesas WHERE id = $1', [id]);
      return { success: true };
    } catch (error) {
      throw new Error(`Error al eliminar mesa: ${error.message}`, { cause: error });
    }
  }
}

module.exports = Tables;
