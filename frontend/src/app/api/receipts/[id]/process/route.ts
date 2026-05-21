import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { extractText } from "@/lib/ocr";
import { parseReceipt } from "@/lib/cohere";
import path from "path";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const receiptId = parseInt(id);
    const receipt = await prisma.receipt.findFirst({
      where: { id: receiptId, user_id: userId }
    });

    if (!receipt) return NextResponse.json({ message: "Struk tidak ditemukan" }, { status: 404 });

    const absoluteImagePath = path.join(process.cwd(), "public", receipt.image_path);
    
    // 1. Run OCR
    const text = await extractText(absoluteImagePath);
    if (!text || text.length < 10) {
      await prisma.receipt.update({ where: { id: receiptId }, data: { status: "failed" } });
      return NextResponse.json({ message: "Foto tidak terbaca dengan baik" }, { status: 422 });
    }

    // 2. Parse with AI
    let parsedData;
    try {
      parsedData = await parseReceipt(text);
    } catch (error) {
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { status: "failed", raw_ocr_text: text }
      });
      return NextResponse.json({ message: "Gagal mengekstrak informasi dari struk" }, { status: 422 });
    }

    // 3. Save to database
    const updatedReceipt = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        raw_ocr_text: text,
        parsed_json: JSON.stringify(parsedData), // Save as JSON string or Prisma will handle it
        status: "parsed",
        store_name: parsedData.store_name,
        receipt_date: parsedData.receipt_date ? new Date(parsedData.receipt_date) : null,
        total_amount: parsedData.total,
        updated_at: new Date()
      }
    });

    // Save Items
    if (parsedData.items && Array.isArray(parsedData.items)) {
      for (const item of parsedData.items) {
        await prisma.receiptItem.create({
          data: {
            receipt_id: receiptId,
            name: item.name,
            quantity: item.quantity || 1,
            price: item.price || 0,
            subtotal: (item.quantity || 1) * (item.price || 0),
            created_at: new Date(),
            updated_at: new Date(),
          }
        });
      }
    }

    const receiptWithItems = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: { items: true }
    });

    return NextResponse.json({ data: receiptWithItems });
  } catch (error) {
    console.error("Process receipt error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
