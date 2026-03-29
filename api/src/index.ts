import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { hocusPocusServer } from "./hocuspocus.js";
import exportRoutes from "./routes/exportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());
app.use("/api/export", exportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
server.on("upgrade", (request, socket, head) => {
  hocusPocusServer.handleConnection(request, socket, head);
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Revision API running on port ${PORT}`);
});
