const express = require("express");

const {
  getDashboardReport,
  getInventoryReport,
  getLocationReport,
  getCategoryReport,
  getSalesReport,
  getPurchaseReport,
} = require("../controllers/reportController");

const router = express.Router();

// Dashboard report
router.get("/dashboard", getDashboardReport);

// Inventory report
router.get("/inventory", getInventoryReport);

// Location-wise report
router.get("/location", getLocationReport);

// Category-wise report
router.get("/category", getCategoryReport);

// Sales report
router.get("/sales", getSalesReport);

// Purchase report
router.get("/purchases", getPurchaseReport);

module.exports = router;