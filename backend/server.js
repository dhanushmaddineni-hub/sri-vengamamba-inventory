require("dotenv").config();

const express = require("express");
const cors = require("cors");

const prisma = require("./lib/prisma");

const healthRoutes = require("./routes/healthRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");

const { authenticateToken } = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic API route
app.get("/", (req, res) => {
  res.json({
    message: "Sri Vengamamba Inventory API is running",
  });
});

// Health route
app.use("/api/health", healthRoutes);

// Category routes
app.use("/api/categories", categoryRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);

// Test PostgreSQL connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;

    res.json({
      success: true,
      message: "PostgreSQL connection successful",
      time: result[0],
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Protected test route
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "You accessed a protected route",
    user: req.user,
  });
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 