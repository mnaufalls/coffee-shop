import { prisma } from "@/lib/prisma";

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