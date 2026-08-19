import { NextResponse } from "next/server";

import { verifySignature, processWebhook, type MidtransNotification } from "@/service/payment.service";

export async function POST(request: Request) {
  try {
    const notification = (await request.json()) as MidtransNotification;

    const isValid = verifySignature(notification);
    if (!isValid) {
      return NextResponse.json({ success: false, message: "Invalid Midtrans signature" }, { status: 401 });
    }

    if (!notification.order_id || !notification.transaction_id) {
      return NextResponse.json({ success: false, message: "Invalid Midtrans notification" }, { status: 400 });
    }

    const result = await processWebhook(notification);

    if (!result.success && result.status) {
      return NextResponse.json({ success: false, message: result.message }, { status: result.status as any });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json({ success: false, message: "Failed to process webhook" }, { status: 500 });
  }
}