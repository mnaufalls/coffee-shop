import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createOrderSchema = z.object({
  userId: z.string().min(1),
  orderType: z.enum(["dine_in", "takeaway"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "At least one item is required"),
  cashierId: z.string().optional(),
  cashierName: z.string().optional(),
  voucherCode: z.string().optional(),
  discountAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;

const TAX_PERCENTAGE = 11;

function decimalToCents(value: { toString(): string }) {
  const [wholePart, decimalPart = ""] = value.toString().split(".");

  const cents = decimalPart.padEnd(2, "0").slice(0, 2);

  return Number(wholePart) * 100 + Number(cents);
}

function centsToDecimal(cents: number) {
  return (cents / 100).toFixed(2);
}

function calculateTax(subtotalCents: number) {
  return Math.round(
    (subtotalCents * TAX_PERCENTAGE) / 100,
  );
}

export async function createOrder(input: CreateOrderInput) {
  const parsed = createOrderSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const productIds = parsed.items.map((item) => item.productId);

    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
      },
    });

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    // Validate product existence and stock
    for (const item of parsed.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error(
          `Product not found: ${item.productId}`,
        );
      }

      if (item.quantity > product.stock) {
        throw new Error(
          `Insufficient stock for product: ${product.name}`,
        );
      }
    }

    let subtotalCents = 0;

    const orderDetails = parsed.items.map((item) => {
      const product = productMap.get(item.productId)!;

      const priceCents = decimalToCents(product.price);

      const itemSubtotalCents =
        priceCents * item.quantity;

      subtotalCents += itemSubtotalCents;

      return {
        productId: product.id,
        productName: product.name,
        price: product.price.toString(),
        quantity: item.quantity,
        subtotal: centsToDecimal(itemSubtotalCents),
      };
    });

    let discountCents = 0;
    let voucherCode: string | null = null;

    // Handle voucher
    if (parsed.voucherCode) {
      const voucher = await tx.voucher.findUnique({
        where: { code: parsed.voucherCode },
      });

      if (!voucher) {
        throw new Error("Voucher not found");
      }

      if (!voucher.isActive) {
        throw new Error("Voucher is not active");
      }

      if (voucher.usageCount >= voucher.usageLimit) {
        throw new Error("Voucher usage limit reached");
      }

      if (subtotalCents < voucher.minPurchaseAmount * 100) {
        throw new Error(
          `Minimum purchase amount is ${centsToDecimal(voucher.minPurchaseAmount * 100)}`,
        );
      }

      discountCents = voucher.discountAmount * 100;
      voucherCode = voucher.code;
    }

    // Use pre-calculated discount if provided
    if (parsed.discountAmount !== undefined) {
      discountCents = Math.round(parsed.discountAmount * 100);
    }

    const taxCents = calculateTax(subtotalCents);

    let totalCents =
      subtotalCents - discountCents + taxCents;

    // Use pre-calculated total if provided
    if (parsed.totalAmount !== undefined) {
      totalCents = Math.round(parsed.totalAmount * 100);
    }

    const order = await tx.order.create({
      data: {
        userId: parsed.userId,
        cashierId: parsed.cashierId ?? null,
        cashierName: parsed.cashierName ?? null,
        orderType: parsed.orderType,
        subtotal: centsToDecimal(subtotalCents),
        discountAmount: centsToDecimal(discountCents),
        voucherCode,
        taxPercentage: TAX_PERCENTAGE.toFixed(2),
        taxAmount: centsToDecimal(taxCents),
        totalAmount: centsToDecimal(totalCents),
        status: "pending",

        orderDetails: {
          create: orderDetails,
        },
      },

      include: {
        orderDetails: true,
      },
    });

    return order;
  });
}
