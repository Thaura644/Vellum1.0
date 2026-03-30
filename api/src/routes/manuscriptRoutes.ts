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
        const manuscripts = await prisma.manuscript.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json(manuscripts);
    } catch (err) {
        console.error("Fetch manuscripts error:", err);
        res.status(500).json({ error: "Failed to fetch manuscripts." });
    }
});

router.get("/project/:projectId", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const manuscripts = await prisma.manuscript.findMany({
            where: { projectId: req.params.projectId, userId: req.user.id },
            orderBy: { order: "asc" }
        });
        res.status(200).json(manuscripts);
    } catch (err) {
        console.error("Fetch manuscripts error:", err);
        res.status(500).json({ error: "Failed to fetch manuscripts." });
    }
});

router.post("/", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { title, order, projectId } = req.body;
        
        const manuscript = await prisma.manuscript.create({
            data: {
                title: title || "Untitled Manuscript",
                order: order || 0,
                projectId,
                userId: req.user.id
            }
        });
        res.status(201).json(manuscript);
    } catch (err) {
        console.error("Create manuscript error:", err);
        res.status(500).json({ error: "Failed to create manuscript." });
    }
});

router.patch("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { title, order } = req.body;
        
        const existing = await prisma.manuscript.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        const manuscript = await prisma.manuscript.update({
            where: { id: req.params.id },
            data: {
                ...(title !== undefined && { title }),
                ...(order !== undefined && { order })
            }
        });
        res.status(200).json(manuscript);
    } catch (err) {
        console.error("Update manuscript error:", err);
        res.status(500).json({ error: "Failed to update manuscript." });
    }
});

router.delete("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const existing = await prisma.manuscript.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        await prisma.manuscript.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Delete manuscript error:", err);
        res.status(500).json({ error: "Failed to delete manuscript." });
    }
});

export default router;
