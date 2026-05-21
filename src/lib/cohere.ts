import axios from "axios";

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const MODEL = process.env.COHERE_MODEL || "command-r-plus-08-2024";

export async function parseReceipt(text: string) {
  if (!COHERE_API_KEY) {
    throw new Error("COHERE_API_KEY is missing");
  }

  // Clean and deduplicate text to prevent Cohere loop error
  const lines = text.split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);
  
  const uniqueLines = Array.from(new Set(lines));
  let cleanText = uniqueLines.join("\n");
  
  if (cleanText.length > 1500) {
    cleanText = cleanText.substring(0, 1500);
  }

  const prompt = `Extract receipt data from this OCR text. 
Return ONLY a valid JSON object with EXACTLY this structure, no markdown, no other text:
{
  "store_name": "string",
  "receipt_date": "YYYY-MM-DD",
  "total": integer,
  "items": [
    { "name": "string", "quantity": integer, "price": integer }
  ]
}

Text:
${cleanText}`;

  try {
    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",
      {
        model: MODEL,
        message: prompt,
        temperature: 0.1,
      },
      {
        headers: {
          "Authorization": `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    let content = response.data.text || "";
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(content);
  } catch (error) {
    console.error("Cohere parsing error:", error);
    throw new Error("AI Parsing failed");
  }
}
