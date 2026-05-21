import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { name, email, password, password_confirmation } = await req.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 422 });
    }

    if (password !== password_confirmation) {
      return NextResponse.json({ message: "Konfirmasi password tidak cocok" }, { status: 422 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 422 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
        categories: {
          create: [
            { name: "Gaji", type: "income", color: "#10b981", icon: "💰", created_at: new Date(), updated_at: new Date() },
            { name: "Makanan", type: "expense", color: "#f43f5e", icon: "🍔", created_at: new Date(), updated_at: new Date() },
            { name: "Transportasi", type: "expense", color: "#3b82f6", icon: "🚗", created_at: new Date(), updated_at: new Date() },
            { name: "Belanja", type: "expense", color: "#a855f7", icon: "🛒", created_at: new Date(), updated_at: new Date() },
            { name: "Tagihan", type: "expense", color: "#f59e0b", icon: "📄", created_at: new Date(), updated_at: new Date() },
            { name: "Hiburan", type: "expense", color: "#ec4899", icon: "🎬", created_at: new Date(), updated_at: new Date() }
          ]
        }
      },
    });

    const token = await createToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
