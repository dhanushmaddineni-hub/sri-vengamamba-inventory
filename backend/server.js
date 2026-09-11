require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("./lib/prisma");
const healthRoutes = require("./routes/healthRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/health", healthRoutes);  
app.use("/api/categories", categoryRoutes);


// Test API
app.get("/", (req, res) => {
  res.json({
    message: "Sri Vengamamba Inventory API is running",
  });
});

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

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});  