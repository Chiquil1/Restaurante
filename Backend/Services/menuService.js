const model = require('../Models/menuModel');

const getAllMenuItems = (filters) => model.getAllMenuItems(filters);
const getCategories = () => model.getCategories();
const createMenuItem = (data) => model.createMenuItem(data);
const updateMenuItem = (id, data) => model.updateMenuItem(id, data);
const deleteMenuItem = (id) => model.deleteMenuItem(id);

module.exports = {
  getAllMenuItems,
  getCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
