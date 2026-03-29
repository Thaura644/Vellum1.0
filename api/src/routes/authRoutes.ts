import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import PrismaPkg from "@prisma/client";
const { PrismaClient } = PrismaPkg;

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "vellum_secret_key_12345";

// Registration Endpoint
router.post("/register", async (req, res): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate random color for cursor
    const color = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        color
      }
    });

    const token = jwt.sign({ id: user.id, name: user.name, color: user.color }, JWT_SECRET, { expiresIn: "7d" });
    
    return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Login Endpoint
router.post("/login", async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id, name: user.name, color: user.color }, JWT_SECRET, { expiresIn: "7d" });
    
    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
