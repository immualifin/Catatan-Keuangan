import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const txId = parseInt(id);
    const transaction = await prisma.transaction.findFirst({
      where: { id: txId, user_id: userId },
      include: { category: true }
    });
    
    if (!transaction) return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ data: transaction });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const txId = parseInt(id);
    const tx = await prisma.transaction.findFirst({ where: { id: txId, user_id: userId } });
    if (!tx) return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });

    const body = await req.json();

    const updated = await prisma.transaction.update({
      where: { id: txId },
      data: {
        category_id: body.category_id ?? tx.category_id,
        type: body.type ?? tx.type,
        amount: body.amount ?? tx.amount,
        description: body.description ?? tx.description,
        transaction_date: body.transaction_date ? new Date(body.transaction_date) : tx.transaction_date,
        updated_at: new Date(),
      }
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const txId = parseInt(id);
    const tx = await prisma.transaction.findFirst({ where: { id: txId, user_id: userId } });
    if (!tx) return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });

    await prisma.transaction.delete({ where: { id: txId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
