// pages/api/screenshot.js
import chromium from "chrome-aws-lambda";
import puppeteerCore from "puppeteer-core";

const isLocal = !process.env.VERCEL;
let puppeteer;

const A4_VIEWPORT = { width: 794, height: 1123 };

export default async function handler(req, res) {
  const targetUrl = req.query.url || "https://example.com";
  const format = (req.query.format || "png").toLowerCase();
  const rawName = req.query.filename || "screenshot";
  const safeName = rawName.replace(/[^a-zA-Z0-9-_]/g, "_");
  let browser = null;

  try {
    if (isLocal) {
      if (!puppeteer) puppeteer = await import("puppeteer");
    } else {
      puppeteer = puppeteerCore;
    }

    const launchOptions = { headless: true };
    if (!isLocal) {
      const execPath = await chromium.executablePath;
      if (!execPath) throw new Error("Chromium binary not available.");
      launchOptions.args = chromium.args;
      launchOptions.defaultViewport = null;
      launchOptions.executablePath = execPath;
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setViewport({
      width: A4_VIEWPORT.width,
      height: A4_VIEWPORT.height,
      deviceScaleFactor: 1,
    });
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    );
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });

    if (format === "pdf") {
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "0.4in",
          bottom: "0.4in",
          left: "0.4in",
          right: "0.4in",
        },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeName}.pdf"`,
      );
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      // Write and end explicitly to avoid any encoding issues
      res.write(pdfBuffer);
      res.end();
    } else {
      const screenshot = await page.screenshot({
        type: "png",
        fullPage: false,
      });
      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeName}.png"`,
      );
      res.setHeader("Content-Length", screenshot.length.toString());
      res.write(screenshot);
      res.end();
    }
  } catch (err) {
    console.error("Screenshot error:", err);
    // If headers already sent, just end
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Failed to capture screenshot", details: err.message });
    } else {
      res.end();
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
}
