import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

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

    const body = await req.json();

    if (!body.category_id || !body.total_amount) {
      return NextResponse.json({ message: "Category ID dan Total Amount wajib" }, { status: 422 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        category_id: body.category_id,
        receipt_id: receiptId,
        type: "expense",
        amount: body.total_amount,
        description: body.store_name ? `Belanja di ${body.store_name}` : "Hasil scan struk",
        transaction_date: body.receipt_date ? new Date(body.receipt_date) : new Date(),
        source: "scan",
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (error) {
    console.error("Confirm receipt error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
