import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      products: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function createCategory(input: z.infer<typeof createCategorySchema>) {
  const parsed = createCategorySchema.parse(input);

  const existing = await prisma.category.findUnique({
    where: { name: parsed.name },
  });

  if (existing) {
    throw new Error("Category name already exists");
  }

  return prisma.category.create({
    data: {
      name: parsed.name,
    },
  });
}

export async function updateCategory(id: string, input: z.infer<typeof updateCategorySchema>) {
  const parsed = updateCategorySchema.parse(input);

  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  const duplicate = await prisma.category.findUnique({
    where: { name: parsed.name },
  });

  if (duplicate && duplicate.id !== id) {
    throw new Error("Category name already exists");
  }

  return prisma.category.update({
    where: { id },
    data: {
      name: parsed.name,
    },
  });
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0) {
    throw new Error("Cannot delete category with existing products");
  }

  await prisma.category.delete({
    where: { id },
  });

  return { message: "Category deleted successfully" };
}
