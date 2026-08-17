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

    if (
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        orderDetails: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        cashier: {
          select: {
            id: true,
            name: true,
            email: true,
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
          discountAmount:
            order.discountAmount.toString(),
          taxPercentage:
            order.taxPercentage.toString(),
          taxAmount: order.taxAmount.toString(),
          totalAmount:
            order.totalAmount.toString(),
          status: order.status,
          refundReason: order.refundReason,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,

          customer: order.user
            ? {
                id: order.user.id,
                name: order.user.name,
                email: order.user.email,
                phoneNumber: order.user.phoneNumber,
              }
            : null,

          cashier: order.cashier
            ? {
                id: order.cashier.id,
                name: order.cashier.name,
                email: order.cashier.email,
              }
            : null,

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
    console.error(
      "Get admin orders error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 },
    );
  }
}