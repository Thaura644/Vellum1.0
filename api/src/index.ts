import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { hocusPocusServer } from "./hocuspocus.js";

dotenv.config();

import exportRoutes from "./routes/exportRoutes.js";
import authRoutes from "./routes/authRoutes.js";

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

// Setup Hocuspocus WebSocket Upgrade
server.on("upgrade", (request, socket, head) => {
  hocusPocusServer.handleConnection(request, socket, head);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Revision API (Hocuspocus enabled) running on port ${PORT}`);
});
