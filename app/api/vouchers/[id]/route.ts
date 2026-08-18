import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getVoucherById,
  updateVoucher,
  deleteVoucher,
} from "@/service/voucher.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateVoucherSchema = z.object({
  code: z.string().min(1).optional(),
  discountAmount: z.number().int().min(1).optional(),
  usageLimit: z.number().int().min(1).optional(),
  minPurchaseAmount: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _request: Request,
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

    if (user.role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    const voucher = await getVoucherById(id);

    if (!voucher) {
      return NextResponse.json(
        {
          success: false,
          message: "Voucher not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { voucher },
    });
  } catch (error) {
    console.error("Get voucher error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch voucher",
      },
      { status: 500 },
    );
  }
}

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

    if (user.role !== "super_admin") {
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

    const result = updateVoucherSchema.safeParse(body);

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

    const voucher = await updateVoucher(id, result.data);

    return NextResponse.json({
      success: true,
      message: "Voucher updated successfully",
      data: { voucher },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Voucher not found") {
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
      error.message === "Voucher code already exists"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 409 },
      );
    }

    console.error("Update voucher error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update voucher",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
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

    if (user.role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    const result = await deleteVoucher(id);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Voucher not found") {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 404 },
      );
    }

    console.error("Delete voucher error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete voucher",
      },
      { status: 500 },
    );
  }
}
