import { PrismaClient } from "../app/generated/prisma/client";
import { UserRole } from "../app/generated/prisma/enums";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcrypt";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // =========================
  // USERS
  // =========================

  const passwordHash = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.upsert({
    where: {
      email: "owner@coffee-shop.test",
    },
    update: {},
    create: {
      name: "Coffee Shop Owner",
      email: "owner@coffee-shop.test",
      phoneNumber: "081234567890",
      passwordHash,
      role: UserRole.super_admin,
    },
  });

  const cashier = await prisma.user.upsert({
    where: {
      email: "cashier@coffee-shop.test",
    },
    update: {},
    create: {
      name: "Coffee Shop Cashier",
      email: "cashier@coffee-shop.test",
      phoneNumber: "081234567891",
      passwordHash,
      role: UserRole.admin,
    },
  });

  const customer = await prisma.user.upsert({
    where: {
      email: "customer@coffee-shop.test",
    },
    update: {},
    create: {
      name: "Coffee Shop Customer",
      email: "customer@coffee-shop.test",
      phoneNumber: "081234567892",
      passwordHash,
      role: UserRole.user,
    },
  });

  // =========================
  // CATEGORIES
  // =========================

  const coffee = await prisma.category.upsert({
    where: {
      name: "Coffee",
    },
    update: {},
    create: {
      name: "Coffee",
    },
  });

  const nonCoffee = await prisma.category.upsert({
    where: {
      name: "Non-Coffee",
    },
    update: {},
    create: {
      name: "Non-Coffee",
    },
  });

  const snack = await prisma.category.upsert({
    where: {
      name: "Snack",
    },
    update: {},
    create: {
      name: "Snack",
    },
  });

  // =========================
  // PRODUCTS
  // =========================

  const products = [
    {
      categoryId: coffee.id,
      name: "Americano",
      description: "Espresso dengan air panas dengan rasa yang clean dan bold.",
      price: 18000,
      stock: 50,
    },
    {
      categoryId: coffee.id,
      name: "Cappuccino",
      description: "Espresso dengan steamed milk dan foam yang lembut.",
      price: 22000,
      stock: 40,
    },
    {
      categoryId: coffee.id,
      name: "Cafe Latte",
      description: "Espresso dengan steamed milk yang creamy dan smooth.",
      price: 23000,
      stock: 40,
    },
    {
      categoryId: nonCoffee.id,
      name: "Matcha Latte",
      description: "Matcha creamy dengan perpaduan susu yang lembut.",
      price: 24000,
      stock: 35,
    },
    {
      categoryId: nonCoffee.id,
      name: "Chocolate",
      description: "Minuman cokelat creamy dengan rasa cokelat yang rich.",
      price: 22000,
      stock: 30,
    },
    {
      categoryId: snack.id,
      name: "Croissant",
      description: "Croissant butter dengan tekstur flaky dan renyah.",
      price: 16000,
      stock: 25,
    },
    {
      categoryId: snack.id,
      name: "French Fries",
      description: "Kentang goreng crispy dengan seasoning gurih.",
      price: 15000,
      stock: 30,
    },
  ];

  for (const product of products) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: product.name,
      },
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          ...product,
          price: product.price,
        },
      });
    }
  }

  console.log("✅ Seed completed!");
  console.log({
    owner: owner.email,
    cashier: cashier.email,
    customer: customer.email,
    categories: 3,
    products: products.length,
  });
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });