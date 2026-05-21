import fs from "fs";
import { createWorker } from "tesseract.js";

export async function extractText(imagePath: string): Promise<string> {
  if (!fs.existsSync(imagePath)) {
    throw new Error("File not found");
  }

  try {
    // Initialize tesseract worker, use /tmp for caching in serverless environments like Vercel
    const worker = await createWorker("ind+eng", 1, {
      cachePath: "/tmp",
      logger: (m) => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`)
    });
    
    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();

    if (text && text.trim().length > 10) {
      return text.trim();
    }
  } catch (error) {
    console.warn("Failed to use ind+eng, falling back to eng...", error);
  }

  // Fallback to eng
  try {
    const workerEng = await createWorker("eng", 1, {
      cachePath: "/tmp",
      logger: (m) => console.log(`[OCR-eng] ${m.status}: ${Math.round(m.progress * 100)}%`)
    });
    
    const { data: { text } } = await workerEng.recognize(imagePath);
    await workerEng.terminate();
    
    if (text && text.trim().length > 10) {
      return text.trim();
    }
    throw new Error("Teks hasil OCR terlalu pendek");
  } catch (fallbackError) {
    console.error("OCR Fallback Error:", fallbackError);
    throw new Error("OCR Failed");
  }
}
