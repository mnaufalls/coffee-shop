import { prisma } from "@/lib/prisma";

export async function getDailyReport(date?: Date) {
  const targetDate = date ?? new Date();

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      orderDetails: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              categoryId: true,
            },
          },
        },
      },
    },
  });

  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  );

  const totalOrders = completedOrders.length;
  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0,
  );
  const averagePerOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statusBreakdown: Record<string, number> = {};
  for (const order of orders) {
    statusBreakdown[order.status] =
      (statusBreakdown[order.status] ?? 0) + 1;
  }

  const orderStatusBreakdown = Object.entries(statusBreakdown).map(
    ([status, count]) => ({
      status,
      count,
    }),
  );

  const hourlyActivity: { hour: number; count: number }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    hourlyActivity.push({
      hour,
      count: completedOrders.filter((order) => {
        const orderHour = new Date(order.createdAt).getHours();
        return orderHour === hour;
      }).length,
    });
  }

  return {
    date: startOfDay.toISOString(),
    totalOrders,
    totalRevenue: totalRevenue.toFixed(2),
    averagePerOrder: averagePerOrder.toFixed(2),
    orderStatusBreakdown,
    hourlyActivity,
  };
}

export async function getMonthlyReport(year: number, month: number) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      orderDetails: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              categoryId: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  );

  const totalOrders = completedOrders.length;
  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0,
  );
  const averagePerOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statusBreakdown: Record<string, number> = {};
  for (const order of orders) {
    statusBreakdown[order.status] =
      (statusBreakdown[order.status] ?? 0) + 1;
  }

  const orderStatusBreakdown = Object.entries(statusBreakdown).map(
    ([status, count]) => ({
      status,
      count,
    }),
  );

  // Daily breakdown
  const dailyBreakdownMap: Record<
    number,
    { orders: number; revenue: number }
  > = {};
  for (const order of completedOrders) {
    const day = new Date(order.createdAt).getDate();
    if (!dailyBreakdownMap[day]) {
      dailyBreakdownMap[day] = { orders: 0, revenue: 0 };
    }
    dailyBreakdownMap[day].orders += 1;
    dailyBreakdownMap[day].revenue += Number(order.totalAmount);
  }

  const dailyBreakdown = Object.entries(dailyBreakdownMap).map(
    ([day, data]) => ({
      day: Number(day),
      orders: data.orders,
      revenue: data.revenue.toFixed(2),
    }),
  );

  // Top products
  const productSalesMap: Record<
    string,
    { productId: string; productName: string; quantity: number; revenue: number }
  > = {};

  for (const order of completedOrders) {
    for (const detail of order.orderDetails) {
      if (!productSalesMap[detail.productId]) {
        productSalesMap[detail.productId] = {
          productId: detail.productId,
          productName: detail.productName,
          quantity: 0,
          revenue: 0,
        };
      }
      productSalesMap[detail.productId].quantity += detail.quantity;
      productSalesMap[detail.productId].revenue += Number(detail.subtotal);
    }
  }

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      revenue: item.revenue.toFixed(2),
    }));

  // Category breakdown
  const categorySalesMap: Record<
    string,
    { categoryId: string; categoryName: string; quantity: number; revenue: number }
  > = {};

  for (const order of completedOrders) {
    for (const detail of order.orderDetails) {
      const catId = detail.product.categoryId;
      const catName = detail.product.category.name;
      if (!categorySalesMap[catId]) {
        categorySalesMap[catId] = {
          categoryId: catId,
          categoryName: catName,
          quantity: 0,
          revenue: 0,
        };
      }
      categorySalesMap[catId].quantity += detail.quantity;
      categorySalesMap[catId].revenue += Number(detail.subtotal);
    }
  }

  const categoryBreakdown = Object.values(categorySalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      quantity: item.quantity,
      revenue: item.revenue.toFixed(2),
    }));

  return {
    year,
    month,
    totalOrders,
    totalRevenue: totalRevenue.toFixed(2),
    averagePerOrder: averagePerOrder.toFixed(2),
    orderStatusBreakdown,
    dailyBreakdown,
    topProducts,
    categoryBreakdown,
  };
}
