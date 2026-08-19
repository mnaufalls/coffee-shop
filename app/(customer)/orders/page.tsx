"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  Spinner,
} from "@phosphor-icons/react";

type OrderDetail = {
  id: string;
  productId: string;
  productName: string;
  price: string;
  quantity: number;
  subtotal: string;
};

type Order = {
  id: string;
  orderType: "dine_in" | "takeaway";
  subtotal: string;
  discountAmount: string;
  taxPercentage: string;
  taxAmount: string;
  totalAmount: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "cancelled"
    | "refunded";
  createdAt: string;
  orderDetails: OrderDetail[];
};

function formatPrice(price: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getStatusClass(status: Order["status"]) {
  switch (status) {
    case "completed":
      return "bg-green-300";
    case "processing":
      return "bg-orange-300";
    case "cancelled":
      return "bg-red-300";
    case "refunded":
      return "bg-purple-300";
    default:
      return "bg-yellow-300";
  }
}

function formatStatus(status: Order["status"]) {
  return status.replace("_", " ").toUpperCase();
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/orders", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ?? "Failed to load orders",
          );
        }

        setOrders(result.data.orders);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load orders",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#f5f0e8] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl border-2 border-black bg-white p-10 text-center shadow-[6px_6px_0_0_#000]">
          <Spinner
            size={48}
            weight="bold"
            className="mx-auto mb-4 animate-spin"
          />
          <p className="font-black uppercase">
            Loading orders...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#f5f0e8] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl border-2 border-black bg-red-300 p-10 text-center shadow-[6px_6px_0_0_#000]">
          <p className="font-black uppercase">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 flex items-center gap-2 border-2 border-black bg-white px-4 py-3 font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            RETRY
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5f0e8] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/profile"
          className="mb-8 inline-flex items-center gap-2 font-black underline underline-offset-4"
        >
          <ArrowLeft size={20} weight="bold" />
          BACK TO PROFILE
        </Link>

        <div className="mb-8">
          <p className="font-black uppercase text-orange-600">
            History
          </p>

          <h1 className="mt-1 text-4xl font-black uppercase sm:text-5xl">
            My Orders
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="border-2 border-black bg-white p-10 text-center shadow-[6px_6px_0_0_#000]">
            <Package
              size={80}
              weight="duotone"
              className="mx-auto mb-6"
            />

            <h2 className="text-3xl font-black uppercase">
              No Orders Yet
            </h2>

            <p className="mt-3 text-zinc-600">
              Your order history will appear here once
              you place an order.
            </p>

            <Link
              href="/menu"
              className="mt-8 inline-flex items-center gap-2 border-2 border-black bg-yellow-300 px-6 py-3 font-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              BROWSE MENU
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() =>
                  router.push(`/orders/${order.id}`)
                }
                className="w-full border-2 border-black bg-white p-5 text-left shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black uppercase">
                      #
                      {order.id
                        .slice(-8)
                        .toUpperCase()}
                    </p>

                    <p className="mt-1 text-sm font-bold text-zinc-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`border-2 border-black px-3 py-1 text-xs font-black uppercase ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>

                    <span className="font-black">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
