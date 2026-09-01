import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export type MidtransNotification = {
  order_id?: string;
  transaction_id?: string;
  transaction_status?: string;
  payment_type?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  fraud_status?: string;
};

export function verifySignature(notification: MidtransNotification): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY is not configured");

  if (!notification.order_id || !notification.status_code || !notification.gross_amount || !notification.signature_key) {
    return false;
  }

  const signature = crypto
    .createHash("sha512")
    .update(`${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`)
    .digest("hex");

  const expectedSignature = Buffer.from(signature);
  const receivedSignature = Buffer.from(notification.signature_key);

  if (expectedSignature.length !== receivedSignature.length) return false;

  return crypto.timingSafeEqual(expectedSignature, receivedSignature);
}

export function getTransactionStatus(notification: MidtransNotification): string {
  const transactionStatus = notification.transaction_status;
  const fraudStatus = notification.fraud_status;

  if (transactionStatus === "settlement") return "settlement";
  if (transactionStatus === "capture") return fraudStatus === "challenge" ? "challenge" : "capture";
  if (transactionStatus === "pending") return "pending";
  if (transactionStatus === "deny") return "deny";
  if (transactionStatus === "cancel") return "cancel";
  if (transactionStatus === "expire") return "expire";
  if (transactionStatus === "refund") return "refund";

  return transactionStatus ?? "unknown";
}

export function getOrderStatus(transactionStatus: string): "pending" | "processing" | "completed" | "cancelled" | null {
  switch (transactionStatus) {
    case "settlement":
    case "capture":
      return "processing";
    case "challenge":
      return "pending";
    case "cancel":
    case "deny":
    case "expire":
    case "refund":
      return "cancelled";
    case "pending":
      return "pending";
    default:
      return null;
  }
}

export async function processWebhook(notification: MidtransNotification) {
  const transactionStatus = getTransactionStatus(notification);
  const orderStatus = getOrderStatus(transactionStatus);

  const transaction = await prisma.transaction.findFirst({
    where: {
      OR: [
        { transactionId: notification.transaction_id },
        { orderId: notification.order_id },
      ],
    },
  });

  if (!transaction) {
    return { success: false, status: 404, message: "Transaction not found" };
  }

  const order = await prisma.order.findUnique({
    where: { id: transaction.orderId },
    include: { orderDetails: true },
  });

  if (!order) {
    return { success: false, status: 404, message: "Order not found" };
  }

  if (order.status === "processing") {
    return { success: true, message: "Order already processed" };
  }

  if (order.status === "cancelled" && orderStatus !== "completed") {
    return { success: true, message: "Order already cancelled" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        transactionId: notification.transaction_id!,
        paymentType: notification.payment_type ?? null,
        status: transactionStatus,
        rawResponse: notification,
      },
    });

    if (orderStatus) {
      await tx.order.update({
        where: { id: transaction.orderId },
        data: { status: orderStatus },
      });
    }
  });

  return { success: true, message: "Webhook processed successfully" };
}