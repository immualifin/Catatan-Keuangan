import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { transaction_date: "desc" },
    });

    return NextResponse.json({ data: transactions });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const body = await req.json();

    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        category_id: body.category_id,
        type: body.type,
        amount: body.amount,
        description: body.description || "",
        transaction_date: new Date(body.transaction_date),
        source: body.source || "manual",
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
