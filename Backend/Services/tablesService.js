const model = require('../Models/tablesModel');
const pool = require('../config/Db');

/**
 * SERVICIO DE MESAS
 * Capa de lógica de negocio. Valida datos y coordina transacciones.
 */

const getMesas = async () => {
  return await model.getMesas();
};

const getMeseros = async () => {
  return await model.getMeseros();
};

const crearMesa = async (data) => {
  if (!data.numero) throw new Error("El número de mesa es requerido");
  if (!data.capacidad) throw new Error("La capacidad es requerida");
  return await model.createMesa(data);
};

const actualizarMesa = async (id, data) => {
  if (!id) throw new Error("El ID de la mesa es requerido");
  return await model.updateMesa(id, data);
};

const cambiarEstado = async (id, estado) => {
  const estadosValidos = ['disponible', 'libre', 'ocupada', 'cuenta', 'pagando', 'reservada', 'solicitada', 'confirmada'];
  if (!estadosValidos.includes(estado)) {
    throw new Error(`Estado inválido. Use uno de los siguientes: ${estadosValidos.join(', ')}`);
  }
  return await model.updateMesa(id, { estado });
};

const asignarMesero = async (id, data) => {
  return await model.updateMesa(id, data);
};

// EL PROCESO DE CHECKOUT (MANTENIDO INTEGRALMENTE)
const checkoutTable = async (id, metodoPago) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const mesaRes = await client.query('SELECT total, estado, cliente FROM mesas WHERE id = $1', [id]);
    const mesaActual = mesaRes.rows[0];

    if (!mesaActual) throw new Error("La mesa no existe en la base de datos");

    if (mesaActual.estado === 'reservada' || mesaActual.estado === 'solicitada') {
      throw new Error("No se puede realizar el cobro de una mesa que aún está en estado de Reserva");
    }

    if (parseFloat(mesaActual.total) <= 0) {
      throw new Error("La mesa no tiene un monto acumulado para cobrar");
    }

    await client.query(`
      INSERT INTO ventas (mesa_id, total, metodo_pago, estado, fecha, nota)
      VALUES ($1, $2, $3, 'completada', CURRENT_TIMESTAMP, $4)
    `, [id, mesaActual.total, metodoPago || 'Efectivo', `Cobro final - Cliente: ${mesaActual.cliente || 'S/N'}`]);

    await client.query(`
      UPDATE mesas 
      SET estado = 'disponible', cliente = '', total = 0, mesero_id = NULL 
      WHERE id = $1
    `, [id]);

    await client.query('COMMIT');
    return { 
      success: true, 
      totalCobrado: mesaActual.total, 
      mensaje: "Cobro realizado y mesa liberada exitosamente" 
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const eliminarMesa = async (id) => {
  return await model.deleteMesa(id);
};

module.exports = {
  getMesas,
  getMeseros,
  crearMesa,
  actualizarMesa,
  cambiarEstado,
  asignarMesero,
  checkoutTable,
  eliminarMesa
};
