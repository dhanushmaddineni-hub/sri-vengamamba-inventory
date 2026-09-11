const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sri Vengamamba API is running",
  });
});

module.exports = router;