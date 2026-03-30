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
        const locations = await prisma.location.findMany({
            where: { userId: req.user.id },
            orderBy: { name: "asc" }
        });
        res.status(200).json(locations);
    } catch (err) {
        console.error("Fetch locations error:", err);
        res.status(500).json({ error: "Failed to fetch locations." });
    }
});

router.get("/project/:projectId", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const locations = await prisma.location.findMany({
            where: { projectId: req.params.projectId, userId: req.user.id },
            orderBy: { name: "asc" }
        });
        res.status(200).json(locations);
    } catch (err) {
        console.error("Fetch locations error:", err);
        res.status(500).json({ error: "Failed to fetch locations." });
    }
});

router.post("/", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { name, description, notes, intExt, timeOfDay, projectId } = req.body;
        
        const location = await prisma.location.create({
            data: {
                name,
                description,
                notes,
                intExt: intExt || "INT",
                timeOfDay: timeOfDay || "DAY",
                projectId,
                userId: req.user.id
            }
        });
        res.status(201).json(location);
    } catch (err) {
        console.error("Create location error:", err);
        res.status(500).json({ error: "Failed to create location." });
    }
});

router.patch("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { name, description, notes, intExt, timeOfDay } = req.body;
        
        const existing = await prisma.location.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        const location = await prisma.location.update({
            where: { id: req.params.id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(notes !== undefined && { notes }),
                ...(intExt !== undefined && { intExt }),
                ...(timeOfDay !== undefined && { timeOfDay })
            }
        });
        res.status(200).json(location);
    } catch (err) {
        console.error("Update location error:", err);
        res.status(500).json({ error: "Failed to update location." });
    }
});

router.delete("/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const existing = await prisma.location.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        await prisma.location.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Delete location error:", err);
        res.status(500).json({ error: "Failed to delete location." });
    }
});

export default router;
