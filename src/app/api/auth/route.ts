import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    return NextResponse.json(
      { error: "SITE_PASSWORD is not configured on the server." },
      { status: 500 }
    );
  }

  // Use timingSafeEqual to prevent timing attacks
  const passwordHash = crypto.createHash("sha256").update(password || "").digest();
  const sitePasswordHash = crypto.createHash("sha256").update(sitePassword).digest();

  if (crypto.timingSafeEqual(passwordHash, sitePasswordHash)) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("wade-wisdom-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("wade-wisdom-auth");
  return response;
}
