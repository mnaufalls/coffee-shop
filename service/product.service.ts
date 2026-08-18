import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().url().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
});

type GetProductsParams = {
  categoryId?: string;
  search?: string;
};

function serializeProduct(product: {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: { toString(): string };
  stock: number;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
  };
}) {
  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    stock: product.stock,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    category: product.category,
  };
}

export async function getProducts(params: GetProductsParams = {}) {
  const { categoryId, search } = params;

  const products = await prisma.product.findMany({
    where: {
      ...(categoryId
        ? {
            categoryId,
          }
        : {}),
      ...(search
        ? {
            name: {
              contains: search,
            },
          }
        : {}),
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map(serializeProduct);
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  return serializeProduct(product);
}

export async function createProduct(input: z.infer<typeof createProductSchema>) {
  const parsed = createProductSchema.parse(input);

  const category = await prisma.category.findUnique({
    where: { id: parsed.categoryId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.name,
      description: parsed.description,
      price: parsed.price,
      stock: parsed.stock,
      categoryId: parsed.categoryId,
      imageUrl: parsed.imageUrl ?? null,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return serializeProduct(product);
}

export async function updateProduct(id: string, input: z.infer<typeof updateProductSchema>) {
  const parsed = updateProductSchema.parse(input);

  const existing = await prisma.product.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Product not found");
  }

  if (parsed.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: parsed.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: parsed,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return serializeProduct(product);
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Product not found");
  }

  const orderDetailCount = await prisma.orderDetail.count({
    where: { productId: id },
  });

  if (orderDetailCount > 0) {
    throw new Error("Cannot delete product with existing order details");
  }

  await prisma.product.delete({
    where: { id },
  });

  return { message: "Product deleted successfully" };
}

export async function updateStock(id: string, stock: number) {
  const existing = await prisma.product.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Product not found");
  }

  const product = await prisma.product.update({
    where: { id },
    data: { stock },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return serializeProduct(product);
}
