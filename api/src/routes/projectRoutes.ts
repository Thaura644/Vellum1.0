import express from "express";
import PrismaPkg from "@prisma/client";
const { PrismaClient } = PrismaPkg;
import { generateTemplateContent, TemplateType } from "../services/templateService.js";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "vellum_secret_key_12345";

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

router.get("/", authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { updatedAt: 'desc' } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/new", authenticateToken, async (req, res) => {
  try {
    const { title, template } = req.body;
    const binaryContent = generateTemplateContent(template as TemplateType || TemplateType.BLANK);
    const project = await prisma.project.create({
      data: { title: title || "Untitled Script", content: binaryContent }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { characters: true, locations: true, notes: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.post("/:projectId/characters", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const character = await prisma.character.create({
      data: { name, description, projectId: req.params.projectId }
    });
    res.status(201).json(character);
  } catch (error) {
    res.status(500).json({ error: "Failed to add character" });
  }
});

router.delete("/characters/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.character.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete character" });
  }
});

router.post("/:projectId/locations", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const location = await prisma.location.create({
      data: { name, description, projectId: req.params.projectId }
    });
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: "Failed to add location" });
  }
});

router.delete("/locations/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete location" });
  }
});

router.post("/:projectId/notes", authenticateToken, async (req, res) => {
  try {
    const { content, type } = req.body;
    const note = await prisma.note.create({
      data: { content, type: type || "General", projectId: req.params.projectId }
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: "Failed to add note" });
  }
});

router.delete("/notes/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.note.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
