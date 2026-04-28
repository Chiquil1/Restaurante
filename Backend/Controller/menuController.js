const menuModel = require('../Models/menuModel');

// CORRECCIÓN: Usar getAllMenu en lugar de getAllMenuItems
exports.getAllMenuItems = async (req, res) => {
    try {
        // Llamada correcta a la función del modelo
        const items = await menuModel.getAllMenu(); 
        res.json(items);
    } catch (error) {
        console.error("Error en getAllMenuItems:", error);
        res.status(500).json({ error: error.message });
    }
};

// CORRECCIÓN: Asegurar que getCategories exista y coincida
exports.getCategories = async (req, res) => {
    try {
        const categories = await menuModel.getCategories();
        res.json(categories);
    } catch (error) {
        console.error("Error en getCategories:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getMenuItemById = async (req, res) => {
    try {
        // Verifica que en el modelo tengas getMenuItemById o usa getMenuById
        const item = await menuModel.getMenuById(req.params.id); 
        if (!item) return res.status(404).json({ error: 'Plato no encontrado' });
        res.json(item);
    } catch (error) {
        console.error("Error en getMenuItemById:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.createMenuItem = async (req, res) => {
    try {
        const item = await menuModel.createMenuItem(req.body);
        res.status(201).json(item);
    } catch (error) {
        console.error("Error en createMenuItem:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const item = await menuModel.updateMenuItem(req.params.id, req.body);
        if (!item) return res.status(404).json({ error: 'Plato no encontrado' });
        res.json(item);
    } catch (error) {
        console.error("Error en updateMenuItem:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        await menuModel.deleteMenuItem(req.params.id);
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error("Error en deleteMenuItem:", error);
        res.status(500).json({ error: error.message });
    }
};
