import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const categories = await prisma.category.findMany({
      where: { user_id: userId },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const body = await req.json();
    if (!body.name || !body.type) {
      return NextResponse.json({ message: "Name dan type wajib" }, { status: 422 });
    }

    const category = await prisma.category.create({
      data: {
        user_id: userId,
        name: body.name,
        type: body.type,
        color: body.color || "#000000",
        icon: body.icon || "🏷️",
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
