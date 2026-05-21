import fs from "fs";
import FormData from "form-data";
import axios from "axios";

export async function extractText(imagePath: string): Promise<string> {
  if (!fs.existsSync(imagePath)) {
    throw new Error("File not found");
  }

  // Sebaiknya Anda mendaftar di ocr.space dan menaruh API Key di file .env
  // Jika belum ada, kita gunakan key "helloworld" (terbatas)
  const apiKey = process.env.OCR_SPACE_API_KEY || "helloworld"; 
  
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(imagePath));
    formData.append("language", "eng"); // eng sangat bagus untuk membaca angka dan struk
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true"); // Meningkatkan akurasi gambar resolusi rendah
    formData.append("OCREngine", "2"); // Engine 2 lebih kuat untuk membaca struk/huruf acak

    const response = await axios.post("https://api.ocr.space/parse/image", formData, {
      headers: {
        apikey: apiKey,
        ...formData.getHeaders(),
      },
      timeout: 20000, // Timeout 20 detik
    });

    if (response.data && response.data.IsErroredOnProcessing === false) {
      const text = response.data.ParsedResults?.[0]?.ParsedText || "";
      if (text.trim().length > 5) {
        return text.trim();
      } else {
        throw new Error("Teks tidak terbaca jelas atau kosong");
      }
    } else {
      console.error("OCR.space API Error:", response.data);
      throw new Error(response.data?.ErrorMessage?.[0] || "Gagal memproses gambar melalui API");
    }
  } catch (error) {
    console.error("Cloud OCR Error:", error);
    throw new Error("Gagal menghubungi server Cloud OCR");
  }
}
