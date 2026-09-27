const prisma = require("../lib/prisma");

// =====================================================
// 1. DASHBOARD REPORT
// =====================================================

const getDashboardReport = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventories: true,
      },
    });

    const inventory = await prisma.inventory.findMany();

    const locations = await prisma.location.findMany();

    const purchases = await prisma.purchase.findMany();

    const sales = await prisma.sale.findMany();

    // Total products
    const totalProducts = products.length;

    // Total stock
    const totalStock = inventory.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Low stock products
    const lowStockProducts = products.filter((product) => {
      const totalProductStock = product.inventories.reduce(
        (total, item) => total + item.quantity,
        0
      );

      return totalProductStock <= product.minimumStock;
    });

    // Inventory value
    const inventoryValue = products.reduce((total, product) => {
      const productStock = product.inventories.reduce(
        (stock, item) => stock + item.quantity,
        0
      );

      return (
        total +
        productStock * Number(product.sellingPrice)
      );
    }, 0);

    // Locations used
    const totalLocations = locations.length;

    // Total purchase amount
    const totalPurchases = purchases.reduce(
      (total, purchase) =>
        total + Number(purchase.totalAmount),
      0
    );

    // Total sales amount
    const totalSales = sales.reduce(
      (total, sale) =>
        total + Number(sale.totalAmount),
      0
    );

    return res.json({
      success: true,
      data: {
        totalProducts,
        totalStock,
        lowStock: lowStockProducts.length,
        inventoryValue,
        totalLocations,
        totalPurchaseInvoices: purchases.length,
        totalSalesInvoices: sales.length,
        totalPurchases,
        totalSales,
      },
    });
  } catch (error) {
    console.error("Dashboard report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate dashboard report",
      error: error.message,
    });
  }
};


// =====================================================
// 2. INVENTORY REPORT
// =====================================================

const getInventoryReport = async (req, res) => {
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

    const report = inventory.map((item) => {
      const quantity = item.quantity;
      const minimumStock = item.product.minimumStock;

      let status = "NORMAL";

      if (quantity === 0) {
        status = "OUT OF STOCK";
      } else if (quantity <= minimumStock) {
        status = "LOW STOCK";
      }

      const sellingPrice =
        Number(item.product.sellingPrice);

      const inventoryValue =
        quantity * sellingPrice;

      return {
        id: item.id,

        productId: item.product.id,
        productName: item.product.name,
        partNumber: item.product.partNumber,

        category: item.product.category
          ? item.product.category.name
          : null,

        brand: item.product.brand
          ? item.product.brand.name
          : null,

        locationId: item.location.id,
        location: item.location.name,

        rack: item.location.rack,
        shelf: item.location.shelf,
        section: item.location.section,

        quantity,

        minimumStock,

        mrp: Number(item.product.mrp),
        sellingPrice,

        inventoryValue,

        status,
      };
    });

    return res.json({
      success: true,
      count: report.length,
      data: report,
    });
  } catch (error) {
    console.error("Inventory report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate inventory report",
      error: error.message,
    });
  }
};


// =====================================================
// 3. LOCATION REPORT
// =====================================================

const getLocationReport = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        inventories: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const report = locations.map((location) => {
      const totalStock = location.inventories.reduce(
        (total, item) => total + item.quantity,
        0
      );

      const totalProducts = location.inventories.length;

      const inventoryValue =
        location.inventories.reduce(
          (total, item) =>
            total +
            item.quantity *
              Number(item.product.sellingPrice),
          0
        );

      return {
        locationId: location.id,
        locationName: location.name,

        rack: location.rack,
        shelf: location.shelf,
        section: location.section,

        totalProducts,
        totalStock,
        inventoryValue,
      };
    });

    return res.json({
      success: true,
      count: report.length,
      data: report,
    });
  } catch (error) {
    console.error("Location report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate location report",
      error: error.message,
    });
  }
};


// =====================================================
// 4. CATEGORY REPORT
// =====================================================

const getCategoryReport = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            inventories: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const report = categories.map((category) => {
      let totalStock = 0;
      let totalProducts = category.products.length;
      let inventoryValue = 0;

      category.products.forEach((product) => {
        const productStock =
          product.inventories.reduce(
            (total, inventory) =>
              total + inventory.quantity,
            0
          );

        totalStock += productStock;

        inventoryValue +=
          productStock *
          Number(product.sellingPrice);
      });

      return {
        categoryId: category.id,
        categoryName: category.name,

        totalProducts,
        totalStock,
        inventoryValue,
      };
    });

    return res.json({
      success: true,
      count: report.length,
      data: report,
    });
  } catch (error) {
    console.error("Category report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate category report",
      error: error.message,
    });
  }
};


// =====================================================
// 5. SALES REPORT
// =====================================================

const getSalesReport = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalSales = sales.reduce(
      (total, sale) =>
        total + Number(sale.totalAmount),
      0
    );

    const totalItemsSold = sales.reduce(
      (total, sale) => {
        return (
          total +
          sale.items.reduce(
            (itemTotal, item) =>
              itemTotal + item.quantity,
            0
          )
        );
      },
      0
    );

    return res.json({
      success: true,

      data: {
        totalInvoices: sales.length,
        totalSales,
        totalItemsSold,

        sales,
      },
    });
  } catch (error) {
    console.error("Sales report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate sales report",
      error: error.message,
    });
  }
};


// =====================================================
// 6. PURCHASE REPORT
// =====================================================

const getPurchaseReport = async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalPurchases = purchases.reduce(
      (total, purchase) =>
        total + Number(purchase.totalAmount),
      0
    );

    const totalItemsPurchased = purchases.reduce(
      (total, purchase) => {
        return (
          total +
          purchase.items.reduce(
            (itemTotal, item) =>
              itemTotal + item.quantity,
            0
          )
        );
      },
      0
    );

    return res.json({
      success: true,

      data: {
        totalInvoices: purchases.length,
        totalPurchases,
        totalItemsPurchased,

        purchases,
      },
    });
  } catch (error) {
    console.error("Purchase report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate purchase report",
      error: error.message,
    });
  }
};


// =====================================================
// EXPORT ALL CONTROLLERS
// =====================================================

module.exports = {
  getDashboardReport,
  getInventoryReport,
  getLocationReport,
  getCategoryReport,
  getSalesReport,
  getPurchaseReport,
};