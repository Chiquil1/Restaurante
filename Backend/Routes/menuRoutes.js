const express = require("express");
const router = express.Router();

const controller = require("../Controller/menuController");

// GET all menu items
router.get("/", controller.getAllMenuItems);

// GET categories
router.get("/categories", controller.getCategories);

// POST create new menu item
router.post("/", controller.createMenuItem);

// PUT update menu item
router.put("/:id", controller.updateMenuItem);

// DELETE menu item
router.delete("/:id", controller.deleteMenuItem);

module.exports = router;
