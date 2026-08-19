import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/service/product.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
  categoryId: z.string().min(1).optional(),
  imageUrl: z.string().optional(),
});

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { product },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
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

    if (user.role !== "admin" && user.role !== "super_admin") {
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

    const result = updateProductSchema.safeParse(body);

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

    const product = await updateProduct(id, result.data);

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Product not found") {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 404 },
      );
    }

    if (error instanceof Error && error.message === "Category not found") {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 404 },
      );
    }

    console.error("Update product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product",
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

    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    const result = await deleteProduct(id);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Product not found") {
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
      error.message === "Cannot delete product with existing order details"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 409 },
      );
    }

    console.error("Delete product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      { status: 500 },
    );
  }
}
