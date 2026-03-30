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
        const notes = await prisma.note.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json(notes);
    } catch (err) {
        console.error("Fetch notes error:", err);
        res.status(500).json({ error: "Failed to fetch notes." });
    }
});

router.get("/project/:projectId", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { includePrivate } = req.query;
        const where: any = { projectId: req.params.projectId, userId: req.user.id };
        
        if (includePrivate === "false") {
            where.isPrivate = false;
        }
        
        const notes = await prisma.note.findMany({
            where,
            orderBy: { updatedAt: "desc" }
        });
        res.status(200).json(notes);
    } catch (err) {
        console.error("Fetch notes error:", err);
        res.status(500).json({ error: "Failed to fetch notes." });
    }
});

router.get("/private/:projectId", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const notes = await prisma.note.findMany({
            where: { projectId: req.params.projectId, userId: req.user.id, isPrivate: true },
            orderBy: { updatedAt: "desc" }
        });
        res.status(200).json(notes);
    } catch (err) {
        console.error("Fetch private notes error:", err);
        res.status(500).json({ error: "Failed to fetch private notes." });
    }
});

router.post("/", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { content, isPrivate, sceneHeading, projectId, act } = req.body;
        
        const note = await prisma.note.create({
            data: {
                content,
                isPrivate: isPrivate || false,
                sceneHeading,
                act: act || 1,
                projectId,
                userId: req.user.id
            }
        });
        res.status(201).json(note);
    } catch (err) {
        console.error("Create note error:", err);
        res.status(500).json({ error: "Failed to create note." });
    }
});

router.patch("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { content, isPrivate, sceneHeading, act } = req.body;
        
        const existing = await prisma.note.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        const note = await prisma.note.update({
            where: { id: req.params.id },
            data: {
                ...(content !== undefined && { content }),
                ...(isPrivate !== undefined && { isPrivate }),
                ...(sceneHeading !== undefined && { sceneHeading }),
                ...(act !== undefined && { act })
            }
        });
        res.status(200).json(note);
    } catch (err) {
        console.error("Update note error:", err);
        res.status(500).json({ error: "Failed to update note." });
    }
});

router.delete("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const existing = await prisma.note.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        await prisma.note.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Delete note error:", err);
        res.status(500).json({ error: "Failed to delete note." });
    }
});

export default router;
