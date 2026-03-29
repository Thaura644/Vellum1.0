import puppeteer from "puppeteer";

export const generatePDF = async (html: string): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Set the content and wait for it to be rendered
  await page.setContent(html, { waitUntil: "networkidle0" });

  // Generate PDF in US Letter format (Standard for Screenplays)
  const pdfBuffer = await page.pdf({
    format: "letter",
    printBackground: true,
    margin: {
      top: "1in",
      bottom: "1in",
      left: "1.5in",
      right: "1in",
    },
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
};
