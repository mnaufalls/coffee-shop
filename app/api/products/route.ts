import { NextRequest, NextResponse } from "next/server";

import { getProducts } from "@/service/product.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const categoryId = searchParams.get("categoryId") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    const products = await getProducts({
      categoryId,
      search,
    });

    return NextResponse.json({
      data: products,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}