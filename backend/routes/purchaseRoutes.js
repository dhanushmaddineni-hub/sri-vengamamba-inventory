const express = require("express");

const {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  getPurchasesBySupplier,
} = require("../controllers/purchaseController");

const router = express.Router();

router.post("/", createPurchase);

router.get("/", getAllPurchases);

router.get("/supplier/:supplierId", getPurchasesBySupplier);

router.get("/:id", getPurchaseById);

module.exports = router;