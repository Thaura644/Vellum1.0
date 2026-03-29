import express from "express";
import PrismaPkg from "@prisma/client";
import jwt from "jsonwebtoken";

const { PrismaClient } = PrismaPkg;
const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "vellum_secret_key_12345";

// Middleware to parse JWT
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

// GET all active projects for the authenticated user
router.get("/", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const projects = await prisma.project.findMany({
            where: { userId: req.user.id, archived: false },
            orderBy: { updatedAt: "desc" },
            // Don't fetch the massive binary content payload for the dashboard
            select: { id: true, title: true, excerpt: true, type: true, progress: true, words: true, updatedAt: true, userId: true }
        });
        res.status(200).json(projects);
    } catch (err) {
        console.error("Fetch projects error:", err);
        res.status(500).json({ error: "Failed to fetch projects." });
    }
});

// POST a new empty project for the user
router.post("/new", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { title, excerpt, type } = req.body || {};
        
        const project = await prisma.project.create({
            data: {
                title: title || "Untitled Project",
                excerpt: excerpt || "Begin typing your masterpiece.",
                type: type || "Feature",
                progress: 0,
                words: 0,
                userId: req.user.id
            }
        });
        res.status(201).json(project);
    } catch (err) {
        console.error("Create project error:", err);
        res.status(500).json({ error: "Failed to create project." });
    }
});

// GET specific project details
router.get("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id }
        });
        if (!project || (project as any).userId !== req.user.id) {
            return res.status(404).json({ error: "Project not found or access denied." });
        }
        // Return a safe subset of fields
        const { id, title, type, progress, words, updatedAt } = project as any;
        const excerpt = (project as any).excerpt;
        res.status(200).json({ id, title, excerpt, type, progress, words, updatedAt });
    } catch (err) {
        console.error("Fetch project error:", err);
        res.status(500).json({ error: "Failed to fetch project." });
    }
});

// PATCH specific project (title, excerpt, words, archving)
router.patch("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { title, excerpt, words, archived } = req.body;
        
        // Verify ownership
        const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: { 
                ...(title !== undefined && { title }),
                ...(excerpt !== undefined && { excerpt }),
                ...(words !== undefined && { words }),
                ...(archived !== undefined && { archived })
            }
        });
        const p = project as any;
        res.status(200).json({ id: p.id, title: p.title, excerpt: p.excerpt, type: p.type, progress: p.progress, words: p.words, archived: p.archived, updatedAt: p.updatedAt });
    } catch (err) {
        console.error("Update project error:", err);
        res.status(500).json({ error: "Failed to update project." });
    }
});

export default router;
