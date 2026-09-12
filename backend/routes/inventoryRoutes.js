const express = require("express");

const {
  createInventory,
  getInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

const router = express.Router();

router.post("/", createInventory);
router.get("/", getInventories);
router.get("/:id", getInventoryById);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

module.exports = router;