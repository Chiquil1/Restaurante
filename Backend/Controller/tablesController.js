const tablesModel = require('../Models/tablesModel');

// Obtener todas las mesas
exports.getAllTables = async (req, res) => {
    try {
        const tables = await tablesModel.getAllTables(req.query);
        res.json(tables);
    } catch (error) {
        console.error("Error en getAllTables:", error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener mesa por ID
exports.getTableById = async (req, res) => {
    try {
        const table = await tablesModel.getTableById(req.params.id);
        if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear mesa
exports.createTable = async (req, res) => {
    try {
        const table = await tablesModel.createTable(req.body);
        res.status(201).json(table);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Ya existe una mesa con este número' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Actualizar mesa
exports.updateTable = async (req, res) => {
    try {
        const table = await tablesModel.updateTable(req.params.id, req.body);
        if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar mesa
exports.deleteTable = async (req, res) => {
    try {
        await tablesModel.deleteTable(req.params.id);
        res.json({ message: 'Mesa eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Endpoint extra para cambiar estado rápidamente
exports.updateStatus = async (req, res) => {
    try {
        const { estado, mesero_id, cliente } = req.body;
        const table = await tablesModel.updateTableStatus(req.params.id, estado, mesero_id, cliente);
        if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
