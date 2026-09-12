const prisma = require("../lib/prisma");

// Create location
const createLocation = async (req, res) => {
  try {
    const {
      name,
      rack,
      shelf,
      section,
      description,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location name is required",
      });
    }

    const location = await prisma.location.create({
      data: {
        name: name.trim(),
        rack: rack ? rack.trim() : null,
        shelf: shelf ? shelf.trim() : null,
        section: section ? section.trim() : null,
        description: description ? description.trim() : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: location,
    });
  } catch (error) {
    console.error("Error creating location:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Location name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create location",
      error: error.message,
    });
  }
};

// Get all locations
const getLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: {
        id: "asc",
      },
      include: {
        inventories: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
      error: error.message,
    });
  }
};

// Get location by ID
const getLocationById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID",
      });
    }

    const location = await prisma.location.findUnique({
      where: {
        id,
      },
      include: {
        inventories: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    return res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Error fetching location:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch location",
      error: error.message,
    });
  }
};

// Update location
const updateLocation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID",
      });
    }

    const {
      name,
      rack,
      shelf,
      section,
      description,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location name is required",
      });
    }

    const location = await prisma.location.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        rack: rack ? rack.trim() : null,
        shelf: shelf ? shelf.trim() : null,
        section: section ? section.trim() : null,
        description: description ? description.trim() : null,
      },
    });

    return res.json({
      success: true,
      message: "Location updated successfully",
      data: location,
    });
  } catch (error) {
    console.error("Error updating location:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Location name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: error.message,
    });
  }
};

// Delete location
const deleteLocation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID",
      });
    }

    await prisma.location.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting location:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete location because it is used by inventory or stock movements",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete location",
      error: error.message,
    });
  }
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};