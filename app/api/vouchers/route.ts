import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getVouchers, createVoucher } from "@/service/voucher.service";

const createVoucherSchema = z.object({
  code: z.string().min(1),
  discountAmount: z.number().int().min(1),
  usageLimit: z.number().int().min(1),
  minPurchaseAmount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

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

    if (user.role !== "super_admin") {
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
    const search = searchParams.get("search") ?? undefined;

    const result = await getVouchers({ page, limit, search });

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("Get vouchers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch vouchers",
      },
      { status: 500 },
    );
  }
}

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

    if (user.role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const result = createVoucherSchema.safeParse(body);

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

    const voucher = await createVoucher(result.data);

    return NextResponse.json(
      {
        success: true,
        message: "Voucher created successfully",
        data: { voucher },
      },
      { status: 201 },
    );
  } catch (error) {
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

    console.error("Create voucher error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create voucher",
      },
      { status: 500 },
    );
  }
}
