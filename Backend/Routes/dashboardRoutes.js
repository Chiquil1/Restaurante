const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../Controller/dashboardController');

router.get('/', getDashboardStats);

module.exports = router;
