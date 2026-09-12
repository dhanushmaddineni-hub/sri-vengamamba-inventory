const prisma = require("../lib/prisma");

// Create product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      partNumber,
      description,
      vehicleModel,
      mrp,
      sellingPrice,
      minimumStock,
      categoryId,
      brandId,
    } = req.body;

    if (
      !name ||
      mrp === undefined ||
      sellingPrice === undefined ||
      categoryId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, mrp, sellingPrice, and categoryId are required",
      });
    }

    const numericMrp = Number(mrp);
    const numericSellingPrice = Number(sellingPrice);
    const numericCategoryId = Number(categoryId);
    const numericBrandId =
      brandId === undefined || brandId === null || brandId === ""
        ? null
        : Number(brandId);

    if (
      !Number.isFinite(numericMrp) ||
      numericMrp < 0 ||
      !Number.isFinite(numericSellingPrice) ||
      numericSellingPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "MRP and selling price must be valid positive numbers",
      });
    }

    if (!Number.isInteger(numericCategoryId)) {
      return res.status(400).json({
        success: false,
        message: "categoryId must be a valid integer",
      });
    }

    if (
      numericBrandId !== null &&
      !Number.isInteger(numericBrandId)
    ) {
      return res.status(400).json({
        success: false,
        message: "brandId must be a valid integer",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: numericCategoryId },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (numericBrandId !== null) {
      const brand = await prisma.brand.findUnique({
        where: { id: numericBrandId },
      });

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        partNumber: partNumber ? partNumber.trim() : null,
        description: description || null,
        vehicleModel: vehicleModel || null,
        mrp: numericMrp,
        sellingPrice: numericSellingPrice,
        minimumStock:
          minimumStock === undefined
            ? 0
            : Number(minimumStock),
        categoryId: numericCategoryId,
        brandId: numericBrandId,
      },
      include: {
        category: true,
        brand: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Part number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: "asc",
      },
      include: {
        category: true,
        brand: true,
        inventories: {
          include: {
            location: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        inventories: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const {
      name,
      partNumber,
      description,
      vehicleModel,
      mrp,
      sellingPrice,
      minimumStock,
      categoryId,
      brandId,
    } = req.body;

    if (
      !name ||
      mrp === undefined ||
      sellingPrice === undefined ||
      categoryId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, mrp, sellingPrice, and categoryId are required",
      });
    }

    const numericMrp = Number(mrp);
    const numericSellingPrice = Number(sellingPrice);
    const numericCategoryId = Number(categoryId);
    const numericBrandId =
      brandId === undefined || brandId === null || brandId === ""
        ? null
        : Number(brandId);

    if (
      !Number.isFinite(numericMrp) ||
      numericMrp < 0 ||
      !Number.isFinite(numericSellingPrice) ||
      numericSellingPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "MRP and selling price must be valid positive numbers",
      });
    }

    if (!Number.isInteger(numericCategoryId)) {
      return res.status(400).json({
        success: false,
        message: "categoryId must be a valid integer",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: numericCategoryId },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (numericBrandId !== null) {
      const brand = await prisma.brand.findUnique({
        where: { id: numericBrandId },
      });

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        partNumber: partNumber ? partNumber.trim() : null,
        description: description || null,
        vehicleModel: vehicleModel || null,
        mrp: numericMrp,
        sellingPrice: numericSellingPrice,
        minimumStock:
          minimumStock === undefined
            ? 0
            : Number(minimumStock),
        categoryId: numericCategoryId,
        brandId: numericBrandId,
      },
      include: {
        category: true,
        brand: true,
      },
    });

    return res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Part number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete product because it is used by another record",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};