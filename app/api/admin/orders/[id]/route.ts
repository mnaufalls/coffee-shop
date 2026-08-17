import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateOrderSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "completed",
    "cancelled",
  ]),
});

export async function PATCH(
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

    const { id } = await context.params;

    const body = await request.json();

    const result = updateOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status: result.data.status,
        cashierId: user.userId,
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
      message: "Order updated successfully",
      data: {
        order: {
          id: updatedOrder.id,
          orderType: updatedOrder.orderType,
          subtotal: updatedOrder.subtotal.toString(),
          discountAmount:
            updatedOrder.discountAmount.toString(),
          taxPercentage:
            updatedOrder.taxPercentage.toString(),
          taxAmount:
            updatedOrder.taxAmount.toString(),
          totalAmount:
            updatedOrder.totalAmount.toString(),
          status: updatedOrder.status,
          refundReason: updatedOrder.refundReason,
          createdAt: updatedOrder.createdAt,
          updatedAt: updatedOrder.updatedAt,

          customer: updatedOrder.user
            ? {
                id: updatedOrder.user.id,
                name: updatedOrder.user.name,
                email: updatedOrder.user.email,
                phoneNumber:
                  updatedOrder.user.phoneNumber,
              }
            : null,

          cashier: updatedOrder.cashier
            ? {
                id: updatedOrder.cashier.id,
                name: updatedOrder.cashier.name,
                email: updatedOrder.cashier.email,
              }
            : null,

          orderDetails:
            updatedOrder.orderDetails.map(
              (detail) => ({
                id: detail.id,
                productId: detail.productId,
                productName: detail.productName,
                price: detail.price.toString(),
                quantity: detail.quantity,
                subtotal:
                  detail.subtotal.toString(),
              }),
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Update admin order error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
      },
      { status: 500 },
    );
  }
}