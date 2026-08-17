import { prisma } from "@/lib/prisma";

type CreateOrderInput = {
  userId: string;
  orderType: "dine_in" | "takeaway";
  items: {
    productId: string;
    quantity: number;
  }[];
};

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

export async function createOrder({
  userId,
  orderType,
  items,
}: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    const productIds = items.map((item) => item.productId);

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
    for (const item of items) {
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

    const orderDetails = items.map((item) => {
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

    const discountCents = 0;
    const taxCents = calculateTax(subtotalCents);

    const totalCents =
      subtotalCents - discountCents + taxCents;

    // Reduce stock inside the same transaction.
    for (const item of items) {
      const product = productMap.get(item.productId)!;

      const updatedProduct =
        await tx.product.updateMany({
          where: {
            id: product.id,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

      if (updatedProduct.count !== 1) {
        throw new Error(
          `Insufficient stock for product: ${product.name}`,
        );
      }
    }

    const order = await tx.order.create({
      data: {
        userId,
        orderType,
        subtotal: centsToDecimal(subtotalCents),
        discountAmount: centsToDecimal(discountCents),
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