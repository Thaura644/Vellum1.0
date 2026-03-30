import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { hocusPocusServer } from "./hocuspocus.js";

dotenv.config();

import exportRoutes from "./routes/exportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import characterRoutes from "./routes/characterRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import actRoutes from "./routes/actRoutes.js";
import manuscriptRoutes from "./routes/manuscriptRoutes.js";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("Revision API is running");
});

// Register API Routes
app.use("/api/export", exportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/acts", actRoutes);
app.use("/api/manuscripts", manuscriptRoutes);

import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ noServer: true });

// Setup Hocuspocus WebSocket Upgrade
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    hocusPocusServer.handleConnection(ws, request);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Revision API (Hocuspocus enabled) running on port ${PORT}`);
});
