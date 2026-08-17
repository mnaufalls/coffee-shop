import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/service/order.service";

const createOrderSchema = z.object({
  orderType: z.enum(["dine_in", "takeaway"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z
          .number()
          .int()
          .min(1)
          .max(99),
      }),
    )
    .min(1, "Cart cannot be empty")
    .refine(
      (items) =>
        new Set(items.map((item) => item.productId))
          .size === items.length,
      {
        message: "Duplicate products are not allowed",
      },
    ),
});

export async function POST(request: Request) {
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

    const body = await request.json();

    const result = createOrderSchema.safeParse(body);

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

    const order = await createOrder({
      userId: user.userId,
      orderType: result.data.orderType,
      items: result.data.items,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: {
          order: {
            id: order.id,
            userId: order.userId,
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
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Product not found:")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 404 },
      );
    }

    if (
      error instanceof Error &&
      error.message.startsWith(
        "Insufficient stock for product:",
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 409 },
      );
    }

    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 },
    );
  }
}

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
        orderDetails: true,
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
    console.error("Get orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get orders",
      },
      { status: 500 },
    );
  }
}