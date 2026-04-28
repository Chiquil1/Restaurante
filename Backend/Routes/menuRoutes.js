const express = require('express');
const router = express.Router();
const menuController = require('../Controller/menuController');

router.get('/', menuController.getAllMenuItems);
router.get('/categorias', menuController.getCategories);
router.get('/:id', menuController.getMenuItemById);
router.post('/', menuController.createMenuItem);
router.put('/:id', menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;
