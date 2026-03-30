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
        const { category } = req.query;
        const where: any = { userId: req.user.id };
        
        if (category) {
            where.category = category as string;
        }
        
        const assets = await prisma.asset.findMany({
            where,
            orderBy: { updatedAt: "desc" }
        });
        res.status(200).json(assets);
    } catch (err) {
        console.error("Fetch assets error:", err);
        res.status(500).json({ error: "Failed to fetch assets." });
    }
});

router.post("/", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { name, type, category, description, content, fileUrl } = req.body;
        
        const asset = await prisma.asset.create({
            data: {
                name,
                type: type || "document",
                category: category || "reference",
                description,
                content,
                fileUrl,
                userId: req.user.id
            }
        });
        res.status(201).json(asset);
    } catch (err) {
        console.error("Create asset error:", err);
        res.status(500).json({ error: "Failed to create asset." });
    }
});

router.patch("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { name, description, content, category } = req.body;
        
        const existing = await prisma.asset.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        const asset = await prisma.asset.update({
            where: { id: req.params.id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(content !== undefined && { content }),
                ...(category !== undefined && { category })
            }
        });
        res.status(200).json(asset);
    } catch (err) {
        console.error("Update asset error:", err);
        res.status(500).json({ error: "Failed to update asset." });
    }
});

router.delete("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const existing = await prisma.asset.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        await prisma.asset.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Delete asset error:", err);
        res.status(500).json({ error: "Failed to delete asset." });
    }
});

export default router;
