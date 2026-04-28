const menuModel = require('../Models/menuModel');

exports.getAllMenuItems = async (req, res) => {
    try {
        const items = await menuModel.getAllMenuItems(req.query);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await menuModel.getCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMenuItemById = async (req, res) => {
    try {
        const item = await menuModel.getMenuItemById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Plato no encontrado' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createMenuItem = async (req, res) => {
    try {
        const item = await menuModel.createMenuItem(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const item = await menuModel.updateMenuItem(req.params.id, req.body);
        if (!item) return res.status(404).json({ error: 'Plato no encontrado' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const result = await menuModel.deleteMenuItem(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
