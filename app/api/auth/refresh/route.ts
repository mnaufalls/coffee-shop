import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  signAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token is required",
        },
        { status: 401 },
      );
    }

    const payload = verifyRefreshToken(refreshToken);

    const accessToken = signAccessToken({
      userId: payload.userId,
      role: payload.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Access token refreshed",
    });

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired refresh token",
      },
      { status: 401 },
    );
  }
}