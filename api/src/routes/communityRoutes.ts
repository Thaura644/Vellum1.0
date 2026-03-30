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

router.get("/shared", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const sharedProjects = await prisma.sharedProject.findMany({
            where: {
                OR: [
                    { ownerId: req.user.id },
                    { isPublic: true }
                ]
            },
            include: { owner: { select: { id: true, name: true, color: true } } },
            orderBy: { updatedAt: "desc" }
        });
        res.status(200).json(sharedProjects);
    } catch (err) {
        console.error("Fetch shared projects error:", err);
        res.status(500).json({ error: "Failed to fetch shared projects." });
    }
});

router.post("/share", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { title, excerpt, type, projectId, isPublic } = req.body;
        
        let content = null;
        if (projectId) {
            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (project && (project as any).userId === req.user.id) {
                content = project.content;
            }
        }

        const sharedProject = await prisma.sharedProject.create({
            data: {
                title,
                excerpt,
                type: type || "Feature",
                isPublic: isPublic || false,
                ownerId: req.user.id
            }
        });
        res.status(201).json(sharedProject);
    } catch (err) {
        console.error("Share project error:", err);
        res.status(500).json({ error: "Failed to share project." });
    }
});

router.get("/public", async (req: any, res: any): Promise<any> => {
    try {
        const sharedProjects = await prisma.sharedProject.findMany({
            where: { isPublic: true },
            include: { owner: { select: { id: true, name: true, color: true } } },
            orderBy: { updatedAt: "desc" },
            take: 50
        });
        res.status(200).json(sharedProjects);
    } catch (err) {
        console.error("Fetch public projects error:", err);
        res.status(500).json({ error: "Failed to fetch public projects." });
    }
});

router.get("/:id/comments", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const comments = await prisma.comment.findMany({
            where: { sharedProjectId: req.params.id },
            include: { author: { select: { id: true, name: true, color: true } } },
            orderBy: { createdAt: "asc" }
        });
        res.status(200).json(comments);
    } catch (err) {
        console.error("Fetch comments error:", err);
        res.status(500).json({ error: "Failed to fetch comments." });
    }
});

router.post("/:id/comments", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { content, sceneHeading, position } = req.body;
        
        const comment = await prisma.comment.create({
            data: {
                content,
                sceneHeading,
                position,
                sharedProjectId: req.params.id,
                authorId: req.user.id
            }
        });
        res.status(201).json(comment);
    } catch (err) {
        console.error("Create comment error:", err);
        res.status(500).json({ error: "Failed to create comment." });
    }
});

router.patch("/comments/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const { content, resolved } = req.body;
        
        const existing = await prisma.comment.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).authorId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        const comment = await prisma.comment.update({
            where: { id: req.params.id },
            data: {
                ...(content !== undefined && { content }),
                ...(resolved !== undefined && { resolved })
            }
        });
        res.status(200).json(comment);
    } catch (err) {
        console.error("Update comment error:", err);
        res.status(500).json({ error: "Failed to update comment." });
    }
});

router.delete("/comments/:id", authenticateToken, async (req: any, res: any): Promise<any> => {
    try {
        const existing = await prisma.comment.findUnique({ where: { id: req.params.id } });
        if (!existing || (existing as any).authorId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden." });
        }

        await prisma.comment.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Delete comment error:", err);
        res.status(500).json({ error: "Failed to delete comment." });
    }
});

export default router;
