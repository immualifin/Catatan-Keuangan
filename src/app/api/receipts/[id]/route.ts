import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const receiptId = parseInt(id);
    const receipt = await prisma.receipt.findFirst({
      where: { id: receiptId, user_id: userId },
      include: { items: true }
    });

    if (!receipt) return NextResponse.json({ message: "Struk tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ data: receipt });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
