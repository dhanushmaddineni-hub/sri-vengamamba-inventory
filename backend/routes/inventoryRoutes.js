const express = require("express");

const {
  getAllInventory,
  getInventoryById,
  getInventoryByProduct,
  getInventoryByLocation,
  transferStock,
  adjustStock,
} = require("../controllers/inventoryController");

const router = express.Router();

// Get all inventory
router.get("/", getAllInventory);

// Get inventory by product
router.get(
  "/product/:productId",
  getInventoryByProduct
);

// Get inventory by location
router.get(
  "/location/:locationId",
  getInventoryByLocation
);

// Transfer stock
router.post(
  "/transfer",
  transferStock
);

// Adjust stock
router.post(
  "/adjust",
  adjustStock
);

// Get inventory by ID
router.get("/:id", getInventoryById);

module.exports = router;