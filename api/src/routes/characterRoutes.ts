import express from "express";
import PrismaPkg from "@prisma/client";
import jwt from "jsonwebtoken";

const { PrismaClient } = PrismaPkg;
const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "vellum_secret_key_12345";

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

router.get("/", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const characters = await prisma.character.findMany({
            where: { userId: req.user.id },
            orderBy: { name: "asc" }
        });
        res.status(200).json(characters);
    } catch (err) {
        console.error("Fetch characters error:", err);
        res.status(500).json({ error: "Failed to fetch characters." });
    }
});

router.get("/project/:projectId", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const characters = await prisma.character.findMany({
            where: { projectId: req.params.projectId, userId: req.user.id },
            orderBy: { name: "asc" }
        });
        res.status(200).json(characters);
    } catch (err) {
        console.error("Fetch characters error:", err);
        res.status(500).json({ error: "Failed to fetch characters." });
    }
});

router.post("/", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { name, description, notes, color, projectId } = req.body;
        
        const character = await prisma.character.create({
            data: {
                name,
                description,
                notes,
                color: color || "#ffb612",
                projectId,
                userId: req.user.id
            }
        });
        res.status(201).json(character);
    } catch (err) {
        console.error("Create character error:", err);
        res.status(500).json({ error: "Failed to create character." });
    }
});

router.patch("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { name, description, notes, color } = req.body;
        
        const existing = await prisma.character.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        const character = await prisma.character.update({
            where: { id: req.params.id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(notes !== undefined && { notes }),
                ...(color !== undefined && { color })
            }
        });
        res.status(200).json(character);
    } catch (err) {
        console.error("Update character error:", err);
        res.status(500).json({ error: "Failed to update character." });
    }
});

router.delete("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const existing = await prisma.character.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        await prisma.character.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Delete character error:", err);
        res.status(500).json({ error: "Failed to delete character." });
    }
});

export default router;
