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

    const orders = await prisma.order.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        orderDetails: {
          select: {
            id: true,
            productId: true,
            productName: true,
            price: true,
            quantity: true,
            subtotal: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          id: order.id,
          orderType: order.orderType,
          subtotal: order.subtotal.toString(),
          discountAmount: order.discountAmount.toString(),
          taxPercentage: order.taxPercentage.toString(),
          taxAmount: order.taxAmount.toString(),
          totalAmount: order.totalAmount.toString(),
          status: order.status,
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
        })),
      },
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 },
    );
  }
}