import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("image") as File;
    
    if (!file) {
      return NextResponse.json({ message: "Image is required" }, { status: 422 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create public/receipts folder if not exists
    const uploadDir = path.join(process.cwd(), "public/receipts");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${crypto.randomBytes(16).toString("hex")}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, filename);
    
    await writeFile(filePath, buffer);

    const receipt = await prisma.receipt.create({
      data: {
        user_id: userId,
        image_path: `/receipts/${filename}`,
        status: "pending",
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({ data: receipt }, { status: 201 });
  } catch (error) {
    console.error("Upload receipt error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
