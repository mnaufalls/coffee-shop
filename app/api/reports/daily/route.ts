import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getDailyReport } from "@/service/report.service";

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

    const dateParam = searchParams.get("date");
    let date: Date | undefined;

    if (dateParam) {
      const parsed = new Date(dateParam);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid date format",
          },
          { status: 400 },
        );
      }
      date = parsed;
    }

    const report = await getDailyReport(date);

    return NextResponse.json({
      success: true,
      data: { report },
    });
  } catch (error) {
    console.error("Get daily report error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch daily report",
      },
      { status: 500 },
    );
  }
}
