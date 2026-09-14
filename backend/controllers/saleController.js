const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createSale = async (req, res) => {
  try {
    const { customerId, invoiceNumber, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one sale item is required"
      });
    }

    if (customerId !== undefined && customerId !== null) {
      const customer = await prisma.customer.findUnique({
        where: {
          id: Number(customerId)
        }
      });

      if (!customer) {
        return res.status(404).json({
          message: "Customer not found"
        });
      }
    }

    let totalAmount = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: {
          id: Number(item.productId)
        }
      });

      if (!product) {
        return res.status(404).json({
          message: `Product with ID ${item.productId} not found`
        });
      }

      const location = await prisma.location.findUnique({
        where: {
          id: Number(item.locationId)
        }
      });

      if (!location) {
        return res.status(404).json({
          message: `Location with ID ${item.locationId} not found`
        });
      }

      const inventory = await prisma.inventory.findUnique({
        where: {
          productId_locationId: {
            productId: Number(item.productId),
            locationId: Number(item.locationId)
          }
        }
      });

      if (!inventory) {
        return res.status(400).json({
          message: `No inventory found for product ${item.productId} at location ${item.locationId}`
        });
      }

      if (inventory.quantity < Number(item.quantity)) {
        return res.status(400).json({
          message: `Insufficient stock for product ${item.productId}. Available stock: ${inventory.quantity}`
        });
      }

      if (Number(item.quantity) <= 0) {
        return res.status(400).json({
          message: "Sale quantity must be greater than zero"
        });
      }

      if (Number(item.sellingPrice) < 0) {
        return res.status(400).json({
          message: "Selling price cannot be negative"
        });
      }

      totalAmount +=
        Number(item.quantity) * Number(item.sellingPrice);
    }

    const sale = await prisma.$transaction(async (transaction) => {
      const createdSale = await transaction.sale.create({
        data: {
          customerId:
            customerId === undefined || customerId === null
              ? null
              : Number(customerId),
          invoiceNumber: invoiceNumber || null,
          totalAmount: totalAmount,
          items: {
            create: items.map((item) => ({
              productId: Number(item.productId),
              locationId: Number(item.locationId),
              quantity: Number(item.quantity),
              sellingPrice: Number(item.sellingPrice)
            }))
          }
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
              location: true
            }
          }
        }
      });

      for (const item of items) {
        await transaction.inventory.update({
          where: {
            productId_locationId: {
              productId: Number(item.productId),
              locationId: Number(item.locationId)
            }
          },
          data: {
            quantity: {
              decrement: Number(item.quantity)
            }
          }
        });
      }

      return createdSale;
    });

    return res.status(201).json({
      message: "Sale created successfully",
      sale
    });
  } catch (error) {
    console.error("Create sale error:", error);

    return res.status(500).json({
      message: "Failed to create sale",
      error: error.message
    });
  }
};

const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json(sales);
  } catch (error) {
    console.error("Get sales error:", error);

    return res.status(500).json({
      message: "Failed to fetch sales",
      error: error.message
    });
  }
};

const getSaleById = async (req, res) => {
  try {
    const saleId = Number(req.params.id);

    if (Number.isNaN(saleId)) {
      return res.status(400).json({
        message: "Invalid sale ID"
      });
    }

    const sale = await prisma.sale.findUnique({
      where: {
        id: saleId
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            location: true
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found"
      });
    }

    return res.status(200).json(sale);
  } catch (error) {
    console.error("Get sale error:", error);

    return res.status(500).json({
      message: "Failed to fetch sale",
      error: error.message
    });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById
};