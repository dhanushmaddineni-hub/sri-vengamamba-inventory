const prisma = require("../lib/prisma");

// Add or update stock at a location
const createInventory = async (req, res) => {
  try {
    const {
      productId,
      locationId,
      quantity,
    } = req.body;

    if (
      productId === undefined ||
      locationId === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Product ID, location ID, and quantity are required",
      });
    }

    const parsedProductId = Number(productId);
    const parsedLocationId = Number(locationId);
    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedProductId) ||
      parsedProductId <= 0 ||
      !Number.isInteger(parsedLocationId) ||
      parsedLocationId <= 0 ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product ID and location ID must be positive integers, and quantity must be a non-negative integer",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: parsedProductId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const location = await prisma.location.findUnique({
      where: {
        id: parsedLocationId,
      },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    const inventory = await prisma.inventory.upsert({
      where: {
        productId_locationId: {
          productId: parsedProductId,
          locationId: parsedLocationId,
        },
      },
      update: {
        quantity: parsedQuantity,
      },
      create: {
        productId: parsedProductId,
        locationId: parsedLocationId,
        quantity: parsedQuantity,
      },
      include: {
        product: true,
        location: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Inventory saved successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Create inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save inventory",
      error: error.message,
    });
  }
};

// Get all inventory records
const getInventories = async (req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
        location: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json({
      success: true,
      count: inventories.length,
      data: inventories,
    });
  } catch (error) {
    console.error("Get inventories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};

// Get inventory by ID
const getInventoryById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    const inventory = await prisma.inventory.findUnique({
      where: {
        id,
      },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
        location: true,
      },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found",
      });
    }

    return res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory record",
      error: error.message,
    });
  }
};

// Update inventory quantity
const updateInventory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    if (
      quantity === undefined ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a non-negative integer",
      });
    }

    const inventory = await prisma.inventory.update({
      where: {
        id,
      },
      data: {
        quantity: Number(quantity),
      },
      include: {
        product: true,
        location: true,
      },
    });

    return res.json({
      success: true,
      message: "Inventory updated successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Update inventory error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update inventory",
      error: error.message,
    });
  }
};

// Delete inventory record
const deleteInventory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    await prisma.inventory.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "Inventory record deleted successfully",
    });
  } catch (error) {
    console.error("Delete inventory error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory record",
      error: error.message,
    });
  }
};

module.exports = {
  createInventory,
  getInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
};