import { NextResponse } from "next/server";

import { getCategories } from "@/service/category.service";

export async function GET() {
  try {
    const categories = await getCategories();

    return NextResponse.json({
      data: categories,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch categories",
      },
      { status: 500 },
    );
  }
}