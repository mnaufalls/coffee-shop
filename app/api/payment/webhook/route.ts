import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type MidtransNotification = {
  order_id?: string;
  transaction_id?: string;
  transaction_status?: string;
  payment_type?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  fraud_status?: string;
};

function verifySignature(
  notification: MidtransNotification,
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY is not configured");
  }

  if (
    !notification.order_id ||
    !notification.status_code ||
    !notification.gross_amount ||
    !notification.signature_key
  ) {
    return false;
  }

  const signature = crypto
    .createHash("sha512")
    .update(
      `${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`,
    )
    .digest("hex");

  const expectedSignature = Buffer.from(signature);
  const receivedSignature = Buffer.from(
    notification.signature_key,
  );

  if (expectedSignature.length !== receivedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedSignature,
    receivedSignature,
  );
}

function getTransactionStatus(
  notification: MidtransNotification,
): string {
  const transactionStatus =
    notification.transaction_status;

  const fraudStatus = notification.fraud_status;

  if (transactionStatus === "settlement") {
    return "settlement";
  }

  if (transactionStatus === "capture") {
    if (fraudStatus === "challenge") {
      return "challenge";
    }

    return "capture";
  }

  if (transactionStatus === "pending") {
    return "pending";
  }

  if (transactionStatus === "deny") {
    return "deny";
  }

  if (transactionStatus === "cancel") {
    return "cancel";
  }

  if (transactionStatus === "expire") {
    return "expire";
  }

  if (transactionStatus === "refund") {
    return "refund";
  }

  return transactionStatus ?? "unknown";
}

function getOrderStatus(
  transactionStatus: string,
): "pending" | "processing" | "cancelled" | "refunded" | null {
  switch (transactionStatus) {
    case "settlement":
    case "capture":
      return "processing";

    case "challenge":
      return "pending";

    case "cancel":
    case "deny":
    case "expire":
      return "cancelled";

    case "refund":
      return "refunded";

    case "pending":
      return "pending";

    default:
      return null;
  }
}

export async function POST(request: Request) {
  try {
    const notification =
      (await request.json()) as MidtransNotification;

    const isValid = verifySignature(notification);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Midtrans signature",
        },
        { status: 401 },
      );
    }

    if (
      !notification.order_id ||
      !notification.transaction_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Midtrans notification",
        },
        { status: 400 },
      );
    }

    const transactionStatus =
      getTransactionStatus(notification);

    const orderStatus =
      getOrderStatus(transactionStatus);

    const transaction =
      await prisma.transaction.findFirst({
        where: {
          OR: [
            {
              transactionId:
                notification.transaction_id,
            },
            {
              orderId: notification.order_id,
            },
          ],
        },
      });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found",
        },
        { status: 404 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          transactionId:
            notification.transaction_id!,
          paymentType:
            notification.payment_type ?? null,
          status: transactionStatus,
          rawResponse: notification,
        },
      });

      if (orderStatus) {
        await tx.order.update({
          where: {
            id: transaction.orderId,
          },
          data: {
            status: orderStatus,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error(
      "Midtrans webhook error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process webhook",
      },
      { status: 500 },
    );
  }
}