import { Router } from "express";
import type { Request, Response } from "express";
import { generatePDF } from "../services/exportService";

const router = Router();

router.post("/pdf", async (req: Request, res: Response) => {
  try {
    const { html, title } = req.body;

    if (!html) {
      return res.status(400).json({ error: "HTML content is required" });
    }

    // Wrap the provided HTML with basic styling for PDF rendering
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap');
          body { font-family: 'Courier Prime', monospace; font-size: 12pt; line-height: 1.2; }
          div[data-type="sceneHeading"] { text-transform: uppercase; font-weight: bold; margin-top: 1rem; }
          div[data-type="character"] { text-transform: uppercase; margin-left: 2in; margin-top: 1rem; }
          div[data-type="dialogue"] { margin-left: 1in; margin-right: 1.5in; }
          div[data-type="parenthetical"] { margin-left: 1.5in; margin-right: 2in; font-style: italic; }
          div[data-type="action"] { margin-top: 1rem; }
          div[data-type="transition"] { text-transform: uppercase; text-align: right; margin-top: 1rem; }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    const pdfBuffer = await generatePDF(fullHtml);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${title || "script"}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF Export Error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
