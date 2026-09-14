const prisma = require("../lib/prisma");

const createPurchase = async (req, res) => {
  try {
    const {
      supplierId,
      invoiceNumber,
      purchaseDate,
      items,
    } = req.body;

    if (!supplierId) {
      return res.status(400).json({
        success: false,
        message: "Supplier ID is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one purchase item is required",
      });
    }

    const supplier = await prisma.supplier.findUnique({
      where: {
        id: Number(supplierId),
      },
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    let totalAmount = 0;

    for (const item of items) {
      if (!item.productId || !item.locationId) {
        return res.status(400).json({
          success: false,
          message: "Product ID and location ID are required",
        });
      }

      if (!item.quantity || Number(item.quantity) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than zero",
        });
      }

      if (
        item.purchasePrice === undefined ||
        Number(item.purchasePrice) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Purchase price is required and cannot be negative",
        });
      }

      const product = await prisma.product.findUnique({
        where: {
          id: Number(item.productId),
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      const location = await prisma.location.findUnique({
        where: {
          id: Number(item.locationId),
        },
      });

      if (!location) {
        return res.status(404).json({
          success: false,
          message: `Location ${item.locationId} not found`,
        });
      }

      totalAmount +=
        Number(item.quantity) * Number(item.purchasePrice);
    }

    const purchase = await prisma.$transaction(async (transaction) => {
      const createdPurchase = await transaction.purchase.create({
        data: {
          supplierId: Number(supplierId),
          invoiceNumber: invoiceNumber || null,
          purchaseDate: purchaseDate
            ? new Date(purchaseDate)
            : new Date(),
          totalAmount,
          items: {
            create: items.map((item) => ({
              productId: Number(item.productId),
              locationId: Number(item.locationId),
              quantity: Number(item.quantity),
              purchasePrice: Number(item.purchasePrice),
            })),
          },
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
              location: true,
            },
          },
        },
      });

      for (const item of items) {
        const existingInventory =
          await transaction.inventory.findFirst({
            where: {
              productId: Number(item.productId),
              locationId: Number(item.locationId),
            },
          });

        if (existingInventory) {
          await transaction.inventory.update({
            where: {
              id: existingInventory.id,
            },
            data: {
              quantity:
                existingInventory.quantity +
                Number(item.quantity),
            },
          });
        } else {
          await transaction.inventory.create({
            data: {
              productId: Number(item.productId),
              locationId: Number(item.locationId),
              quantity: Number(item.quantity),
            },
          });
        }
      }

      return createdPurchase;
    });

    return res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: purchase,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create purchase",
    });
  }
};

const getAllPurchases = async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: {
        id: "desc",
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            location: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchases",
    });
  }
};

const getPurchaseById = async (req, res) => {
  try {
    const purchaseId = Number(req.params.id);

    const purchase = await prisma.purchase.findUnique({
      where: {
        id: purchaseId,
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            location: true,
          },
        },
      },
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase",
    });
  }
};

const getPurchasesBySupplier = async (req, res) => {
  try {
    const supplierId = Number(req.params.supplierId);

    const purchases = await prisma.purchase.findMany({
      where: {
        supplierId,
      },
      orderBy: {
        id: "desc",
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            location: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch supplier purchases",
    });
  }
};

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  getPurchasesBySupplier,
};