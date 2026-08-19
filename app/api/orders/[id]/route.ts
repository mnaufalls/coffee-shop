import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
) {
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

    const { id } = await context.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.userId,
      },
      include: {
        orderDetails: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          orderType: order.orderType,
          subtotal: order.subtotal.toString(),
          discountAmount:
            order.discountAmount.toString(),
          taxPercentage:
            order.taxPercentage.toString(),
          taxAmount: order.taxAmount.toString(),
          totalAmount:
            order.totalAmount.toString(),
          status: order.status,
          note: order.note,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          orderDetails: order.orderDetails.map(
            (detail) => ({
              id: detail.id,
              productId: detail.productId,
              productName: detail.productName,
              price: detail.price.toString(),
              quantity: detail.quantity,
              subtotal: detail.subtotal.toString(),
            }),
          ),
        },
      },
    });
  } catch (error) {
    console.error("Get order detail error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
      },
      { status: 500 },
    );
  }
}