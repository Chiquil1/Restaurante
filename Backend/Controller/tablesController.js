const tablesModel = require('../Models/tablesModel');

exports.getAllTables = async (req, res) => {
    try {
        const tables = await tablesModel.getAllTables();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las mesas: " + error.message });
    }
};

exports.getTableById = async (req, res) => {
    try {
        const table = await tablesModel.getTableById(req.params.id);
        if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la mesa: " + error.message });
    }
};

exports.getWaiters = async (req, res) => {
    try {
        const waiters = await tablesModel.getWaiters();
        res.json(waiters);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los meseros: " + error.message });
    }
};

exports.createTable = async (req, res) => {
    try {
        const table = await tablesModel.createTable(req.body);
        res.status(201).json(table);
    } catch (error) {
        // --- MEJORA PREMIUM: Manejo de errores específicos ---
        
        // Código 23505 es el error de "Unique Violation" en Postgres
        if (error.code === '23505') {
            return res.status(400).json({ 
                error: 'El número de mesa ya existe. Por favor, elige un número diferente.' 
            });
        }

        console.error("Error detallando creación de mesa:", error);
        res.status(500).json({ error: "Error interno del servidor: " + error.message });
    }
};

exports.updateTable = async (req, res) => {
    try {
        const table = await tablesModel.updateTable(req.params.id, req.body);
        if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la mesa: " + error.message });
    }
};

exports.deleteTable = async (req, res) => {
    try {
        const result = await tablesModel.deleteTable(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la mesa: " + error.message });
    }
};
