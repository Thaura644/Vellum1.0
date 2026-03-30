import express from "express";
import puppeteer from "puppeteer";

const router = express.Router();

function htmlToFountain(html: string): string {
    let fountain = html
        .replace(/<p class="scene-heading"[^>]*>(.*?)<\/p>/gi, '\n.$1\n')
        .replace(/<p class="action"[^>]*>(.*?)<\/p>/gi, '\n$1\n')
        .replace(/<p class="character"[^>]*>(.*?)<\/p>/gi, '\n@$1\n')
        .replace(/<p class="dialogue"[^>]*>(.*?)<\/p>/gi, '\n$1\n')
        .replace(/<p class="parenthetical"[^>]*>(.*?)<\/p>/gi, '\n($1)\n')
        .replace(/<p class="transition"[^>]*>(.*?)<\/p>/gi, '\n>$1\n')
        .replace(/<p class="shot"[^>]*>(.*?)<\/p>/gi, '\n.$1\n')
        .replace(/<p class="stage-direction"[^>]*>(.*?)<\/p>/gi, '\n[$1]\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
    return fountain;
}

router.post("/pdf", async (req, res): Promise<any> => {
  let browser = null;
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: "Missing document content." });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // The frontend passes raw TipTap HTML. We wrap it in standard screenplay margins and fonts.
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: letter;
              margin: 1in 1in 1in 1.5in;
            }
            body {
              font-family: 'Courier Prime', Courier, monospace;
              font-size: 12pt;
              line-height: 1.0;
              color: black;
              background: white;
            }
            p { margin: 0; padding: 0; }
            h1, h2, h3, h4, h5, h6 { margin: 0; font-weight: normal; font-size: 12pt; }
            
            /* Screenplay Standard Indentations (relative to left margin) */
            .scene-heading { text-transform: uppercase; margin-top: 24pt; margin-bottom: 12pt; font-weight: bold; }
            .action { margin-top: 12pt; margin-bottom: 12pt; }
            .character { text-transform: uppercase; margin-left: 170pt; margin-top: 16pt; margin-bottom: 0; }
            .dialogue { margin-left: 90pt; margin-right: 90pt; margin-top: 0; margin-bottom: 12pt; }
            .parenthetical { margin-left: 130pt; margin-right: 130pt; margin-top: 0; margin-bottom: 0; }
            .transition { text-transform: uppercase; text-align: right; margin-right: 0; margin-top: 16pt; margin-bottom: 12pt; }
            .shot { text-transform: uppercase; margin-top: 24pt; margin-bottom: 12pt; }
            .outline-note { display: none !important; }
            .stage-direction { font-style: italic; margin-top: 12pt; margin-bottom: 12pt; }
          </style>
        </head>
        <body>
          <div class="screenplay-content">
            ${content}
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlTemplate, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: "<div style='font-family: \"Courier Prime\", monospace; font-size: 10pt; width: 100%; text-align: right; padding-right: 1in;'><span class='pageNumber'></span></div>"
    });

    res.contentType("application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=\"script.pdf\"");
    res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF Export failed:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  } finally {
    if (browser) await browser.close();
  }
});

router.post("/fountain", async (req, res): Promise<any> => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Missing document content." });
        }
        const fountain = htmlToFountain(content);
        res.setHeader("Content-Disposition", "attachment; filename=\"script.fountain\"");
        res.setHeader("Content-Type", "text/plain");
        res.send(fountain);
    } catch (error) {
        console.error("Fountain Export failed:", error);
        res.status(500).json({ error: "Failed to generate Fountain" });
    }
});

router.post("/json", async (req, res): Promise<any> => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Missing document content." });
        }
        res.setHeader("Content-Disposition", "attachment; filename=\"script.json\"");
        res.setHeader("Content-Type", "application/json");
        res.json({ content, exportedAt: new Date().toISOString() });
    } catch (error) {
        console.error("JSON Export failed:", error);
        res.status(500).json({ error: "Failed to export JSON" });
    }
});

router.post("/import/fountain", async (req, res): Promise<any> => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Missing fountain content." });
        }
        
        const lines = content.split('\n');
        let html = '<p class="action"></p>';
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            if (trimmed.startsWith('.')) {
                html += `<p class="scene-heading">${trimmed.substring(1).trim()}</p>`;
            } else if (trimmed.startsWith('@')) {
                html += `<p class="character">${trimmed.substring(1).trim()}</p>`;
            } else if (trimmed.startsWith('>')) {
                html += `<p class="transition">${trimmed.substring(1).trim()}</p>`;
            } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
                html += `<p class="parenthetical">${trimmed}</p>`;
            } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                html += `<p class="stage-direction">${trimmed.slice(1, -1)}</p>`;
            } else {
                html += `<p class="action">${trimmed}</p>`;
            }
        }
        
        res.json({ html, success: true });
    } catch (error) {
        console.error("Fountain Import failed:", error);
        res.status(500).json({ error: "Failed to import Fountain" });
    }
});

router.post("/import/json", async (req, res): Promise<any> => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Missing JSON content." });
        }
        
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        res.json({ html: parsed.content || '', success: true });
    } catch (error) {
        console.error("JSON Import failed:", error);
        res.status(500).json({ error: "Failed to import JSON" });
    }
});

export default router;
