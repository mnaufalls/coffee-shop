import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { snap } from "@/lib/midtrans/client";

const snapTokenSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export async function POST(request: Request) {
  try {
    // 1. Authentication
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

    // 2. Validate request
    const body = await request.json();

    const result = snapTokenSchema.safeParse(body);

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

    const { orderId } = result.data;

    // 3. Get order
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: true,
        orderDetails: true,
      },
    });

    // 4. Order not found
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }

    // 5. Make sure order belongs to current user
    if (order.userId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to access this order",
        },
        { status: 403 },
      );
    }

    // 6. Only pending orders can start payment
    if (order.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "Order is not available for payment",
        },
        { status: 409 },
      );
    }

    // 7. Convert total to integer Rupiah
    const grossAmount = Number(order.totalAmount);

    if (
      !Number.isSafeInteger(grossAmount) ||
      grossAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order total",
        },
        { status: 500 },
      );
    }

    // 8. Build Midtrans transaction parameters
    const discountAmount = Number(order.discountAmount);

    const itemDetails = [
      ...order.orderDetails.map((detail) => ({
        id: detail.productId,
        price: Number(detail.price),
        quantity: detail.quantity,
        name: detail.productName,
      })),

      {
        id: `tax-${order.id}`,
        price: Number(order.taxAmount),
        quantity: 1,
        name: `Tax ${Number(order.taxPercentage)}%`,
      },
    ];

    if (discountAmount > 0) {
      itemDetails.push({
        id: `discount-${order.id}`,
        price: -discountAmount,
        quantity: 1,
        name: "Discount",
      });
    }

    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: grossAmount,
      },

      customer_details: {
        first_name: order.user.name,
        email: order.user.email,
        phone: order.user.phoneNumber,
      },

      item_details: itemDetails,

      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/orders/${order.id}`,
      },
    };

    // 9. Generate Midtrans Snap transaction
    const transaction = await snap.createTransaction(
      parameter,
    );

    // 10. Save Midtrans transaction
    await prisma.transaction.create({
      data: {
        orderId: order.id,
        transactionId: order.id,
        paymentType: null,
        status: "pending",
        rawResponse: transaction,
      },
    });

    // 11. Return payment token and redirect URL
    return NextResponse.json({
      success: true,
      message: "Midtrans payment token created",
      data: {
        orderId: order.id,
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
      },
    });
  } catch (error) {
    console.error(
      "Create Midtrans Snap token error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create Midtrans payment",
      },
      { status: 500 },
    );
  }
}