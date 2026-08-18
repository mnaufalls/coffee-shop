import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getVoucherByCode } from "@/service/voucher.service";

const validateVoucherSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
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

    const result = validateVoucherSchema.safeParse(body);

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

    const { code, subtotal } = result.data;

    const voucher = await getVoucherByCode(code);

    if (!voucher) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          message: "Voucher not found or inactive",
        },
      });
    }

    if (voucher.usageCount >= voucher.usageLimit) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          message: "Voucher usage limit reached",
        },
      });
    }

    if (subtotal < voucher.minPurchaseAmount) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          message: `Minimum purchase amount is ${voucher.minPurchaseAmount}`,
        },
      });
    }

    const discount = Math.min(voucher.discountAmount, subtotal);

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        voucher,
        discount,
      },
    });
  } catch (error) {
    console.error("Validate voucher error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to validate voucher",
      },
      { status: 500 },
    );
  }
}
