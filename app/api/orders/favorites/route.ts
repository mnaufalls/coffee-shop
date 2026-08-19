import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserFavorites } from "@/service/order.service";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const favorites = await getUserFavorites(user.userId);

    return NextResponse.json({
      success: true,
      data: { favorites },
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get favorites" },
      { status: 500 },
    );
  }
}