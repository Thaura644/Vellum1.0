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

// Middleware to parse JWT for protected routes here
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// GET current user profile
router.get("/me", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, color: true, goal: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ error: "User not found." });
        res.status(200).json(user);
    } catch (error) {
        console.error("Fetch user error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// PATCH current user profile
router.patch("/me", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { name, color, goal } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name !== undefined && { name }),
                ...(color !== undefined && { color }),
                ...(goal !== undefined && { goal })
            },
            select: { id: true, name: true, email: true, color: true, goal: true }
        });
        res.status(200).json(user);
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default router;
