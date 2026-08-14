import { NextResponse } from "next/server";

import { getProductById } from "@/service/product.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: product,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch product",
      },
      { status: 500 },
    );
  }
}