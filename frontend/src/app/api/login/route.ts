import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ message: "Email dan password wajib diisi" }, { status: 422 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Kredensial tidak valid" }, { status: 401 });
    }

    // Replace Laravel's $2y$ prefix with bcryptjs compatible $2a$ if needed
    let hashToVerify = user.password;
    if (hashToVerify.startsWith("$2y$")) {
      hashToVerify = "$2a$" + hashToVerify.slice(4);
    }

    const isValid = await bcrypt.compare(password, hashToVerify);
    if (!isValid) {
      return NextResponse.json({ message: "Kredensial tidak valid" }, { status: 401 });
    }

    const token = await createToken(user.id);
    
    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
