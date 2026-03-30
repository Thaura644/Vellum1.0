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
        const acts = await prisma.act.findMany({
            where: { userId: req.user.id },
            orderBy: { order: "asc" }
        });
        res.status(200).json(acts);
    } catch (err) {
        console.error("Fetch acts error:", err);
        res.status(500).json({ error: "Failed to fetch acts." });
    }
});

router.get("/project/:projectId", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const acts = await prisma.act.findMany({
            where: { projectId: req.params.projectId, userId: req.user.id },
            orderBy: { order: "asc" }
        });
        res.status(200).json(acts);
    } catch (err) {
        console.error("Fetch acts error:", err);
        res.status(500).json({ error: "Failed to fetch acts." });
    }
});

router.post("/", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { title, summary, order, projectId } = req.body;
        
        const act = await prisma.act.create({
            data: {
                title: title || "Act",
                summary,
                order: order || 0,
                projectId,
                userId: req.user.id
            }
        });
        res.status(201).json(act);
    } catch (err) {
        console.error("Create act error:", err);
        res.status(500).json({ error: "Failed to create act." });
    }
});

router.patch("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { title, summary, order } = req.body;
        
        const existing = await prisma.act.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        const act = await prisma.act.update({
            where: { id: req.params.id },
            data: {
                ...(title !== undefined && { title }),
                ...(summary !== undefined && { summary }),
                ...(order !== undefined && { order })
            }
        });
        res.status(200).json(act);
    } catch (err) {
        console.error("Update act error:", err);
        res.status(500).json({ error: "Failed to update act." });
    }
});

router.delete("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const existing = await prisma.act.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        await prisma.act.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Delete act error:", err);
        res.status(500).json({ error: "Failed to delete act." });
    }
});

export default router;
