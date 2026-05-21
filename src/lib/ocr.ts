import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

export async function extractText(imagePath: string): Promise<string> {
  if (!fs.existsSync(imagePath)) {
    throw new Error("File not found");
  }

  try {
    // Try with ind+eng first
    const { stdout } = await execAsync(`tesseract "${imagePath}" stdout -l ind+eng`);
    if (stdout.trim().length > 10) return stdout.trim();
  } catch (error) {
    console.warn("Failed to use ind+eng, falling back to eng...");
  }

  // Fallback to eng
  try {
    const { stdout } = await execAsync(`tesseract "${imagePath}" stdout -l eng`);
    return stdout.trim();
  } catch (error) {
    throw new Error("OCR Failed");
  }
}
