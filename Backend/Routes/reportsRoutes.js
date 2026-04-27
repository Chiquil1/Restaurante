const express = require("express");
const router = express.Router();

const controller = require("../Controller/reportsController");

// GET sales report
router.get("/sales", controller.getSalesReport);

// GET reservations report
router.get("/reservations", controller.getReservationsReport);

// GET occupancy report
router.get("/occupancy", controller.getOccupancyReport);

// GET menu popularity report
router.get("/menu-popularity", controller.getMenuPopularityReport);

// GET staff performance report
router.get("/staff-performance", controller.getStaffPerformanceReport);

module.exports = router;
