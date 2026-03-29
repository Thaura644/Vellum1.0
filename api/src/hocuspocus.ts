import { Hocuspocus } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import PrismaPkg from "@prisma/client";
import jwt from "jsonwebtoken";
const { PrismaClient } = PrismaPkg;
import { Logger } from "@hocuspocus/extension-logger";

const prisma = new PrismaClient();

export const hocusPocusServer = new Hocuspocus({
  extensions: [
    new Logger(),
    new Database({
      fetch: async ({ documentName }) => {
        try {
           const project = await prisma.project.findUnique({ where: { id: documentName } });
           return project?.content || null;
        } catch (error) {
           console.error("Error fetching document:", error);
           return null;
        }
      },
      store: async ({ documentName, state }) => {
        try {
           const binaryState = Buffer.from(state);
           await prisma.project.update({
             where: { id: documentName },
             data: { content: binaryState }
           });
        } catch (error) {
           console.error("Error storing document:", error);
        }
      }
    })
  ],
  async onAuthenticate(data: any) {
    const token = data.token;
    if (!token) throw new Error("Unauthorized: No token provided");
    
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "vellum_secret_key_12345");
      return {
        user: {
          id: decoded.id,
          name: decoded.name,
          color: decoded.color
        }
      };
    } catch(e) {
      throw new Error("Unauthorized: Invalid token");
    }
  }
});

