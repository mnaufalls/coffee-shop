import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getMyOrders } from "@/service/order.service";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const orders = await getMyOrders(user.userId);

    return NextResponse.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}