import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { changeStaffPassword } from "@/service/staff.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const changePasswordSchema = z.object({
  password: z.string().min(8),
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

    const result = changePasswordSchema.safeParse(body);

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

    const response = await changeStaffPassword(id, result.data.password);

    return NextResponse.json({
      success: true,
      message: response.message,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Staff not found") {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 404 },
      );
    }

    console.error("Change staff password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to change password",
      },
      { status: 500 },
    );
  }
}
