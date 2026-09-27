const prisma = require("../lib/prisma");

// ============================================================
// GET ALL INVENTORY
// ============================================================
const getAllInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
        location: true,
      },
      orderBy: [
        {
          productId: "asc",
        },
        {
          locationId: "asc",
        },
      ],
    });

    return res.json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};

// ============================================================
// GET INVENTORY BY ID
// ============================================================
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
    console.error("Get inventory by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory record",
      error: error.message,
    });
  }
};

// ============================================================
// GET INVENTORY BY PRODUCT
// ============================================================
const getInventoryByProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const inventory = await prisma.inventory.findMany({
      where: {
        productId,
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
      orderBy: {
        locationId: "asc",
      },
    });

    return res.json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    console.error("Get product inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product inventory",
      error: error.message,
    });
  }
};

// ============================================================
// GET INVENTORY BY LOCATION
// ============================================================
const getInventoryByLocation = async (req, res) => {
  try {
    const locationId = Number(req.params.locationId);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID",
      });
    }

    const inventory = await prisma.inventory.findMany({
      where: {
        locationId,
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
      orderBy: {
        productId: "asc",
      },
    });

    return res.json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    console.error("Get location inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch location inventory",
      error: error.message,
    });
  }
};

// ============================================================
// STOCK TRANSFER
// ============================================================
const transferStock = async (req, res) => {
  try {
    const {
      productId,
      fromLocationId,
      toLocationId,
      quantity,
    } = req.body;

    const parsedProductId = Number(productId);
    const parsedFromLocationId = Number(fromLocationId);
    const parsedToLocationId = Number(toLocationId);
    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedProductId) ||
      parsedProductId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (
      !Number.isInteger(parsedFromLocationId) ||
      parsedFromLocationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid source location",
      });
    }

    if (
      !Number.isInteger(parsedToLocationId) ||
      parsedToLocationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination location",
      });
    }

    if (parsedFromLocationId === parsedToLocationId) {
      return res.status(400).json({
        success: false,
        message:
          "Source and destination locations must be different",
      });
    }

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Transfer quantity must be greater than 0",
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

    const sourceLocation = await prisma.location.findUnique({
      where: {
        id: parsedFromLocationId,
      },
    });

    if (!sourceLocation) {
      return res.status(404).json({
        success: false,
        message: "Source location not found",
      });
    }

    const destinationLocation =
      await prisma.location.findUnique({
        where: {
          id: parsedToLocationId,
        },
      });

    if (!destinationLocation) {
      return res.status(404).json({
        success: false,
        message: "Destination location not found",
      });
    }

    const sourceInventory =
      await prisma.inventory.findUnique({
        where: {
          productId_locationId: {
            productId: parsedProductId,
            locationId: parsedFromLocationId,
          },
        },
      });

    if (!sourceInventory) {
      return res.status(404).json({
        success: false,
        message:
          "No inventory record exists at the source location",
      });
    }

    if (sourceInventory.quantity < parsedQuantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available stock at ${sourceLocation.name}: ${sourceInventory.quantity}`,
      });
    }

    const result = await prisma.$transaction(async (transaction) => {
      const updatedSource =
        await transaction.inventory.update({
          where: {
            id: sourceInventory.id,
          },
          data: {
            quantity: {
              decrement: parsedQuantity,
            },
          },
        });

      const existingDestination =
        await transaction.inventory.findUnique({
          where: {
            productId_locationId: {
              productId: parsedProductId,
              locationId: parsedToLocationId,
            },
          },
        });

      let updatedDestination;

      if (existingDestination) {
        updatedDestination =
          await transaction.inventory.update({
            where: {
              id: existingDestination.id,
            },
            data: {
              quantity: {
                increment: parsedQuantity,
              },
            },
          });
      } else {
        updatedDestination =
          await transaction.inventory.create({
            data: {
              productId: parsedProductId,
              locationId: parsedToLocationId,
              quantity: parsedQuantity,
            },
          });
      }

      return {
        source: updatedSource,
        destination: updatedDestination,
      };
    });

    return res.json({
      success: true,
      message: "Stock transferred successfully",
      data: {
        product: {
          id: product.id,
          name: product.name,
        },
        fromLocation: {
          id: sourceLocation.id,
          name: sourceLocation.name,
        },
        toLocation: {
          id: destinationLocation.id,
          name: destinationLocation.name,
        },
        quantity: parsedQuantity,
        result,
      },
    });
  } catch (error) {
    console.error("Transfer stock error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to transfer stock",
      error: error.message,
    });
  }
};

// ============================================================
// STOCK ADJUSTMENT
// ============================================================
const adjustStock = async (req, res) => {
  try {
    const {
      productId,
      locationId,
      adjustmentQuantity,
    } = req.body;

    const parsedProductId = Number(productId);
    const parsedLocationId = Number(locationId);
    const parsedAdjustment = Number(adjustmentQuantity);

    if (
      !Number.isInteger(parsedProductId) ||
      parsedProductId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (
      !Number.isInteger(parsedLocationId) ||
      parsedLocationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID",
      });
    }

    if (
      !Number.isInteger(parsedAdjustment) ||
      parsedAdjustment === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Adjustment quantity must be a non-zero integer",
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

    const existingInventory =
      await prisma.inventory.findUnique({
        where: {
          productId_locationId: {
            productId: parsedProductId,
            locationId: parsedLocationId,
          },
        },
      });

    if (!existingInventory) {
      if (parsedAdjustment < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot reduce stock because no inventory record exists at this location",
        });
      }

      const createdInventory =
        await prisma.inventory.create({
          data: {
            productId: parsedProductId,
            locationId: parsedLocationId,
            quantity: parsedAdjustment,
          },
          include: {
            product: true,
            location: true,
          },
        });

      return res.json({
        success: true,
        message: "Stock adjusted successfully",
        data: createdInventory,
      });
    }

    const newQuantity =
      existingInventory.quantity + parsedAdjustment;

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: `Adjustment would make stock negative. Current stock: ${existingInventory.quantity}`,
      });
    }

    const updatedInventory =
      await prisma.inventory.update({
        where: {
          id: existingInventory.id,
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: true,
          location: true,
        },
      });

    return res.json({
      success: true,
      message: "Stock adjusted successfully",
      data: updatedInventory,
    });
  } catch (error) {
    console.error("Adjust stock error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to adjust stock",
      error: error.message,
    });
  }
};

module.exports = {
  getAllInventory,
  getInventoryById,
  getInventoryByProduct,
  getInventoryByLocation,
  transferStock,
  adjustStock,
};