import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    const orderDetails = await prisma.orderDetail.findMany({
      where: {
        order: {
          userId: user.userId,
        },
      },
      select: {
        productId: true,
        productName: true,
        quantity: true,
      },
    });

    const productMap: Record<
      string,
      { productId: string; productName: string; totalQuantity: number }
    > = {};

    for (const detail of orderDetails) {
      if (!productMap[detail.productId]) {
        productMap[detail.productId] = {
          productId: detail.productId,
          productName: detail.productName,
          totalQuantity: 0,
        };
      }
      productMap[detail.productId].totalQuantity += detail.quantity;
    }

    const favorites = Object.values(productMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: { favorites },
    });
  } catch (error) {
    console.error("Get favorites error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get favorites",
      },
      { status: 500 },
    );
  }
}
