import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { updateOrderStatus } from "@/service/order.service";

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
  note: z.string().optional(),
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

    const updatedOrder = await updateOrderStatus(
      id,
      result.data.status,
      result.data.note,
      user.userId
    );

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: {
        order: updatedOrder,
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