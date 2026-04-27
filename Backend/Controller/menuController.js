const service = require("../Services/menuService");

exports.getAllMenuItems = async (req, res) => {
  try {
    const filters = {
      categoria: req.query.categoria,
      search: req.query.search,
    };

    const items = await service.getAllMenuItems(filters);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await service.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const item = await service.createMenuItem(req.body);
    res.status(201).json({
      message: "Plato creado exitosamente",
      item,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await service.updateMenuItem(id, req.body);
    res.json({
      message: "Plato actualizado exitosamente",
      item,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await service.deleteMenuItem(id);
    res.json({ message: "Plato eliminado exitosamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
