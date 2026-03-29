import { Server } from "socket.io";
import * as Y from "yjs";

export const setupCollaboration = (io: Server) => {
  const docs = new Map<string, Y.Doc>();

  io.on("connection", (socket) => {
    const projectId = socket.handshake.query.projectId as string;

    if (!projectId) {
      socket.disconnect();
      return;
    }

    console.log(`User connected to project: ${projectId}`);

    let doc = docs.get(projectId);
    if (!doc) {
      doc = new Y.Doc();
      docs.set(projectId, doc);
    }

    // Initial sync: Send current doc state to the new client
    socket.emit("y-update", Y.encodeStateAsUpdate(doc));

    // Handle Yjs sync messages
    socket.on("y-update", (update: Buffer) => {
      Y.applyUpdate(doc!, new Uint8Array(update));
      socket.broadcast.emit("y-update", update);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected from project: ${projectId}`);
    });
  });
};
