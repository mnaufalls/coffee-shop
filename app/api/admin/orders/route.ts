import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      prisma.order.count(),
    ]);

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
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
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
