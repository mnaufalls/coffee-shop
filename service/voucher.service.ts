import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createVoucherSchema = z.object({
  code: z.string().min(1, "Code is required"),
  discountAmount: z.number().int().positive("Discount must be positive"),
  usageLimit: z.number().int().positive("Usage limit must be positive"),
  minPurchaseAmount: z.number().int().min(0, "Min purchase must be non-negative"),
  isActive: z.boolean().optional().default(true),
});

const updateVoucherSchema = z.object({
  code: z.string().min(1).optional(),
  discountAmount: z.number().int().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  minPurchaseAmount: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

type GetVouchersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

function serializeVoucher(voucher: {
  id: string;
  code: string;
  discountAmount: number;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
  minPurchaseAmount: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: voucher.id,
    code: voucher.code,
    discountAmount: voucher.discountAmount,
    isActive: voucher.isActive,
    usageLimit: voucher.usageLimit,
    usageCount: voucher.usageCount,
    minPurchaseAmount: voucher.minPurchaseAmount,
    createdAt: voucher.createdAt,
    updatedAt: voucher.updatedAt,
  };
}

export async function getVouchers(params: GetVouchersParams = {}) {
  const { page = 1, limit = 10, search } = params;

  const where = {
    ...(search
      ? {
          code: {
            contains: search,
          },
        }
      : {}),
  };

  const [vouchers, total] = await Promise.all([
    prisma.voucher.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.voucher.count({ where }),
  ]);

  return {
    data: vouchers.map(serializeVoucher),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getVoucherById(id: string) {
  const voucher = await prisma.voucher.findUnique({
    where: { id },
  });

  if (!voucher) {
    return null;
  }

  return serializeVoucher(voucher);
}

export async function getVoucherByCode(code: string) {
  const voucher = await prisma.voucher.findUnique({
    where: { code },
  });

  if (!voucher || !voucher.isActive) {
    return null;
  }

  return serializeVoucher(voucher);
}

export async function createVoucher(input: z.infer<typeof createVoucherSchema>) {
  const parsed = createVoucherSchema.parse(input);

  const existing = await prisma.voucher.findUnique({
    where: { code: parsed.code },
  });

  if (existing) {
    throw new Error("Voucher code already exists");
  }

  const voucher = await prisma.voucher.create({
    data: {
      code: parsed.code,
      discountAmount: parsed.discountAmount,
      usageLimit: parsed.usageLimit,
      minPurchaseAmount: parsed.minPurchaseAmount,
      isActive: parsed.isActive,
    },
  });

  return serializeVoucher(voucher);
}

export async function updateVoucher(id: string, input: z.infer<typeof updateVoucherSchema>) {
  const parsed = updateVoucherSchema.parse(input);

  const existing = await prisma.voucher.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Voucher not found");
  }

  if (parsed.code) {
    const duplicate = await prisma.voucher.findUnique({
      where: { code: parsed.code },
    });

    if (duplicate && duplicate.id !== id) {
      throw new Error("Voucher code already exists");
    }
  }

  const voucher = await prisma.voucher.update({
    where: { id },
    data: parsed,
  });

  return serializeVoucher(voucher);
}

export async function deleteVoucher(id: string) {
  const existing = await prisma.voucher.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Voucher not found");
  }

  await prisma.voucher.delete({
    where: { id },
  });

  return { message: "Voucher deleted successfully" };
}
