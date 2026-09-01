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

    if (parsed.discountAmount !== undefined) {
      discountCents = Math.round(parsed.discountAmount * 100);
    }

    const taxCents = calculateTax(subtotalCents);

    let totalCents =
      subtotalCents - discountCents + taxCents;

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

export async function getUserOrders(userId: string, page: number, limit: number) {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { orderDetails: true },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      orderType: order.orderType,
      subtotal: order.subtotal.toString(),
      discountAmount: order.discountAmount.toString(),
      taxPercentage: order.taxPercentage.toString(),
      taxAmount: order.taxAmount.toString(),
      totalAmount: order.totalAmount.toString(),
      status: order.status,
      note: order.note ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderDetails: order.orderDetails.map((detail) => ({
        id: detail.id,
        productId: detail.productId,
        productName: detail.productName,
        price: detail.price.toString(),
        quantity: detail.quantity,
        subtotal: detail.subtotal.toString(),
      })),
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAdminOrders(page: number, limit: number) {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        orderDetails: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        cashier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.order.count(),
  ]);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      orderType: order.orderType,
      subtotal: order.subtotal.toString(),
      discountAmount: order.discountAmount.toString(),
      taxPercentage: order.taxPercentage.toString(),
      taxAmount: order.taxAmount.toString(),
      totalAmount: order.totalAmount.toString(),
      status: order.status,
      note: order.note ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: order.user
        ? {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
            phoneNumber: order.user.phoneNumber,
          }
        : null,
      cashier: order.cashier
        ? {
            id: order.cashier.id,
            name: order.cashier.name,
            email: order.cashier.email,
          }
        : null,
      orderDetails: order.orderDetails.map((detail) => ({
        id: detail.id,
        productId: detail.productId,
        productName: detail.productName,
        price: detail.price.toString(),
        quantity: detail.quantity,
        subtotal: detail.subtotal.toString(),
      })),
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getMyOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      orderDetails: {
        select: {
          id: true,
          productId: true,
          productName: true,
          price: true,
          quantity: true,
          subtotal: true,
        },
      },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    orderType: order.orderType,
    subtotal: order.subtotal.toString(),
    discountAmount: order.discountAmount.toString(),
    taxPercentage: order.taxPercentage.toString(),
    taxAmount: order.taxAmount.toString(),
    totalAmount: order.totalAmount.toString(),
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    orderDetails: order.orderDetails.map((detail) => ({
      id: detail.id,
      productId: detail.productId,
      productName: detail.productName,
      price: detail.price.toString(),
      quantity: detail.quantity,
      subtotal: detail.subtotal.toString(),
    })),
  }));
}

export async function getUserFavorites(userId: string) {
  const orderDetails = await prisma.orderDetail.findMany({
    where: { order: { userId } },
    select: {
      productId: true,
      productName: true,
      quantity: true,
    },
  });

  const productMap: Record<string, { productId: string; productName: string; totalQuantity: number }> = {};

  for (const detail of orderDetails) {
    if (!productMap[detail.productId]) {
      productMap[detail.productId] = {
        productId: detail.productId,
        productName: detail.productName,
        totalQuantity: 0,
      };
    }
    productMap[detail.productId].totalQuantity += detail.quantity;
  }

  return Object.values(productMap)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);
}

export async function updateOrderStatus(orderId: string, status: string, note: string | undefined, cashierId: string) {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderDetails: true },
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  if (status === "completed" && existingOrder.status !== "completed") {
    await prisma.$transaction(async (tx) => {
      for (const detail of existingOrder.orderDetails) {
        await tx.product.update({
          where: { id: detail.productId },
          data: { stock: { decrement: detail.quantity } },
        });
      }

      if (existingOrder.voucherCode) {
        const voucher = await tx.voucher.findUnique({
          where: { code: existingOrder.voucherCode },
        });
        if (voucher && voucher.usageCount < voucher.usageLimit) {
          await tx.voucher.update({
            where: { id: voucher.id },
            data: { usageCount: { increment: 1 } },
          });
        }
      }
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as any,
      note,
      cashierId,
    },
    include: {
      orderDetails: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
        },
      },
      cashier: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    id: updatedOrder.id,
    orderType: updatedOrder.orderType,
    subtotal: updatedOrder.subtotal.toString(),
    discountAmount: updatedOrder.discountAmount.toString(),
    taxPercentage: updatedOrder.taxPercentage.toString(),
    taxAmount: updatedOrder.taxAmount.toString(),
    totalAmount: updatedOrder.totalAmount.toString(),
    status: updatedOrder.status,
    note: updatedOrder.note,
    createdAt: updatedOrder.createdAt,
    updatedAt: updatedOrder.updatedAt,
    customer: updatedOrder.user
      ? {
          id: updatedOrder.user.id,
          name: updatedOrder.user.name,
          email: updatedOrder.user.email,
          phoneNumber: updatedOrder.user.phoneNumber,
        }
      : null,
    cashier: updatedOrder.cashier
      ? {
          id: updatedOrder.cashier.id,
          name: updatedOrder.cashier.name,
          email: updatedOrder.cashier.email,
        }
      : null,
    orderDetails: updatedOrder.orderDetails.map((detail) => ({
      id: detail.id,
      productId: detail.productId,
      productName: detail.productName,
      price: detail.price.toString(),
      quantity: detail.quantity,
      subtotal: detail.subtotal.toString(),
    })),
  };
}
