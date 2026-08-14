import { NextResponse } from "next/server";

import { getCategoryById } from "@/service/category.service";

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

    const category = await getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        {
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: category,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch category",
      },
      { status: 500 },
    );
  }
}