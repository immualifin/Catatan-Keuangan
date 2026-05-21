import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const categoryId = parseInt(id);
    const category = await prisma.category.findFirst({ where: { id: categoryId, user_id: userId } });
    
    if (!category) {
      return NextResponse.json({ message: "Kategori tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: body.name ?? category.name,
        type: body.type ?? category.type,
        color: body.color ?? category.color,
        icon: body.icon ?? category.icon,
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

    const categoryId = parseInt(id);
    const category = await prisma.category.findFirst({ where: { id: categoryId, user_id: userId } });
    
    if (!category) {
      return NextResponse.json({ message: "Kategori tidak ditemukan" }, { status: 404 });
    }

    await prisma.category.delete({ where: { id: categoryId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
