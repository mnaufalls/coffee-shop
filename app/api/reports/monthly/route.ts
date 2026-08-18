import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getMonthlyReport } from "@/service/report.service";

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

    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    if (!yearParam || !monthParam) {
      return NextResponse.json(
        {
          success: false,
          message: "Year and month query parameters are required",
        },
        { status: 400 },
      );
    }

    const year = Number(yearParam);
    const month = Number(monthParam);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid year or month",
        },
        { status: 400 },
      );
    }

    const report = await getMonthlyReport(year, month);

    return NextResponse.json({
      success: true,
      data: { report },
    });
  } catch (error) {
    console.error("Get monthly report error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch monthly report",
      },
      { status: 500 },
    );
  }
}
