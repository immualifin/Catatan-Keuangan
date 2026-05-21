import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const userId = await getAuthUser(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  // With stateless JWT, we just return success and let client drop the token.
  return NextResponse.json({ message: "Logout successful" });
}
