import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getStaffById, updateStaff } from "@/service/staff.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(1).optional(),
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

    const staff = await getStaffById(id);

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { staff },
    });
  } catch (error) {
    console.error("Get staff error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch staff",
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

    const result = updateStaffSchema.safeParse(body);

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

    const staff = await updateStaff(id, result.data);

    return NextResponse.json({
      success: true,
      message: "Staff updated successfully",
      data: { staff },
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

    if (
      error instanceof Error &&
      error.message === "Email already registered"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 409 },
      );
    }

    console.error("Update staff error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update staff",
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

    const staff = await updateStaff(id, { isActive: false });

    return NextResponse.json({
      success: true,
      message: "Staff deactivated successfully",
      data: { staff },
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

    console.error("Delete staff error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to deactivate staff",
      },
      { status: 500 },
    );
  }
}
