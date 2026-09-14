const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createBrand = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Brand name is required"
      });
    }

    const existingBrand = await prisma.brand.findUnique({
      where: {
        name: name.trim()
      }
    });

    if (existingBrand) {
      return res.status(409).json({
        message: "Brand already exists"
      });
    }

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        description: description || null
      }
    });

    return res.status(201).json({
      message: "Brand created successfully",
      brand
    });
  } catch (error) {
    console.error("Create brand error:", error);

    return res.status(500).json({
      message: "Failed to create brand",
      error: error.message
    });
  }
};

const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        products: true
      },
      orderBy: {
        name: "asc"
      }
    });

    return res.status(200).json(brands);
  } catch (error) {
    console.error("Get brands error:", error);

    return res.status(500).json({
      message: "Failed to fetch brands",
      error: error.message
    });
  }
};

const getBrandById = async (req, res) => {
  try {
    const brandId = Number(req.params.id);

    if (Number.isNaN(brandId)) {
      return res.status(400).json({
        message: "Invalid brand ID"
      });
    }

    const brand = await prisma.brand.findUnique({
      where: {
        id: brandId
      },
      include: {
        products: true
      }
    });

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found"
      });
    }

    return res.status(200).json(brand);
  } catch (error) {
    console.error("Get brand error:", error);

    return res.status(500).json({
      message: "Failed to fetch brand",
      error: error.message
    });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brandId = Number(req.params.id);
    const { name, description } = req.body;

    if (Number.isNaN(brandId)) {
      return res.status(400).json({
        message: "Invalid brand ID"
      });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Brand name is required"
      });
    }

    const existingBrand = await prisma.brand.findUnique({
      where: {
        id: brandId
      }
    });

    if (!existingBrand) {
      return res.status(404).json({
        message: "Brand not found"
      });
    }

    const duplicateBrand = await prisma.brand.findFirst({
      where: {
        name: name.trim(),
        NOT: {
          id: brandId
        }
      }
    });

    if (duplicateBrand) {
      return res.status(409).json({
        message: "Another brand already uses this name"
      });
    }

    const updatedBrand = await prisma.brand.update({
      where: {
        id: brandId
      },
      data: {
        name: name.trim(),
        description: description || null
      }
    });

    return res.status(200).json({
      message: "Brand updated successfully",
      brand: updatedBrand
    });
  } catch (error) {
    console.error("Update brand error:", error);

    return res.status(500).json({
      message: "Failed to update brand",
      error: error.message
    });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const brandId = Number(req.params.id);

    if (Number.isNaN(brandId)) {
      return res.status(400).json({
        message: "Invalid brand ID"
      });
    }

    const existingBrand = await prisma.brand.findUnique({
      where: {
        id: brandId
      }
    });

    if (!existingBrand) {
      return res.status(404).json({
        message: "Brand not found"
      });
    }

    const productsUsingBrand = await prisma.product.count({
      where: {
        brandId: brandId
      }
    });

    if (productsUsingBrand > 0) {
      return res.status(400).json({
        message: "Cannot delete this brand because products are using it"
      });
    }

    await prisma.brand.delete({
      where: {
        id: brandId
      }
    });

    return res.status(200).json({
      message: "Brand deleted successfully"
    });
  } catch (error) {
    console.error("Delete brand error:", error);

    return res.status(500).json({
      message: "Failed to delete brand",
      error: error.message
    });
  }
};

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand
};