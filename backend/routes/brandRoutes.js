const express = require("express");

const {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand
} = require("../controllers/brandController");

const router = express.Router();

router.post("/", createBrand);

router.get("/", getBrands);

router.get("/:id", getBrandById);

router.put("/:id", updateBrand);

router.delete("/:id", deleteBrand);

module.exports = router;