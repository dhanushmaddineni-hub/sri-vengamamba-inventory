
const bcrypt = require("bcryptjs");

const prisma = require("../lib/prisma");
const { generateToken } = require("../utils/jwt");

// ==========================================
// REGISTER USER
// ==========================================

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check whether email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with STAFF role only
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "STAFF",
      },
    });

    // Generate JWT token
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  register,
  login,
};
