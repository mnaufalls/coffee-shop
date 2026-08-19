import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getProfile } from "@/service/auth.service";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const user = await getProfile(currentUser.userId);

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch current user" },
      { status: 500 },
    );
  }
}