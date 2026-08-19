"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
  note: string | null;
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

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function fetchOrder() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `/api/orders/${params.id}`,
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ?? "Failed to load order",
          );
        }

        setOrder(result.data.order);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load order",
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#f5f0e8] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl border-2 border-black bg-white p-10 text-center shadow-[6px_6px_0_0_#000]">
          <Spinner
            size={48}
            weight="bold"
            className="mx-auto mb-4 animate-spin"
          />
          <p className="font-black uppercase">
            Loading order...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !order) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#f5f0e8] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl border-2 border-black bg-red-300 p-10 text-center shadow-[6px_6px_0_0_#000]">
          <Package
            size={64}
            weight="bold"
            className="mx-auto mb-4"
          />
          <p className="font-black uppercase">
            {errorMessage ?? "Order not found"}
          </p>
          <Link
            href="/profile"
            className="mt-5 inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-3 font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <ArrowLeft size={18} weight="bold" />
            BACK TO PROFILE
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5f0e8] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/profile"
          className="mb-8 inline-flex items-center gap-2 font-black underline underline-offset-4"
        >
          <ArrowLeft size={20} weight="bold" />
          BACK TO PROFILE
        </Link>

        {/* Order Header */}
        <div className="mb-6 border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-zinc-500">
                Order ID
              </p>

              <p className="mt-1 font-black uppercase">
                #{order.id.slice(-8).toUpperCase()}
              </p>

              <p className="mt-2 text-sm font-bold text-zinc-600">
                {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase">
                {order.orderType.replace("_", " ")}
              </span>

              <span
                className={`border-2 border-black px-3 py-2 text-xs font-black ${getStatusClass(
                  order.status,
                )}`}
              >
                {formatStatus(order.status)}
              </span>
            </div>
          </div>

          {order.note && (
            <div className="mt-4 border-t-2 border-black pt-4">
              <p className="text-sm font-black">
                {order.note}
              </p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-6 border-2 border-black bg-white shadow-[5px_5px_0_0_#000]">
          <div className="border-b-2 border-black bg-zinc-100 p-5">
            <h2 className="font-black uppercase">
              Items
            </h2>
          </div>

          <div className="divide-y-2 divide-black">
            {order.orderDetails.map((detail) => (
              <div
                key={detail.id}
                className="flex items-start justify-between gap-4 p-5"
              >
                <div>
                  <p className="font-black uppercase">
                    {detail.productName}
                  </p>

                  <p className="mt-1 text-sm text-zinc-600">
                    {detail.quantity} ×{" "}
                    {formatPrice(detail.price)}
                  </p>
                </div>

                <p className="shrink-0 font-black">
                  {formatPrice(detail.subtotal)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="border-2 border-black bg-yellow-300 p-6 shadow-[5px_5px_0_0_#000]">
          <h2 className="mb-4 font-black uppercase">
            Summary
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase">
                Subtotal
              </span>
              <span className="font-black">
                {formatPrice(order.subtotal)}
              </span>
            </div>

            {Number(order.discountAmount) > 0 && (
              <div className="flex items-center justify-between">
                <span className="font-black uppercase text-green-700">
                  Discount
                </span>
                <span className="font-black text-green-700">
                  -{" "}
                  {formatPrice(order.discountAmount)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-black uppercase">
                Tax {order.taxPercentage}%
              </span>
              <span className="font-black">
                {formatPrice(order.taxAmount)}
              </span>
            </div>

            <div className="border-t-2 border-black pt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-black uppercase">
                  Total
                </span>
                <span className="text-lg font-black">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
