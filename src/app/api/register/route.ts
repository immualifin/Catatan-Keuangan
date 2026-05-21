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
