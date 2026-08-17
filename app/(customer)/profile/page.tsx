"use client";

import { useEffect, useState } from "react";
import {
  ArrowClockwise,
  Clock,
  Envelope,
  Package,
  Phone,
  UserCircle,
} from "@phosphor-icons/react";

type Profile = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
};

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
  status: "pending" | "processing" | "completed" | "cancelled" | "refunded";
  createdAt: string;
  updatedAt: string;
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState<string | null>(null);


useEffect(() => {
  async function fetchProfile() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [profileResponse, ordersResponse] =
        await Promise.all([
          fetch("/api/profile", {
            cache: "no-store",
          }),
          fetch("/api/orders", {
            cache: "no-store",
          }),
        ]);

      const profileResult = await profileResponse.json();
      const ordersResult = await ordersResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileResult.message ?? "Failed to load profile",
        );
      }

      if (!ordersResponse.ok) {
        throw new Error(
          ordersResult.message ?? "Failed to load orders",
        );
      }

      setProfile(profileResult.data.user);
      setOrders(ordersResult.data.orders);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load profile",
      );
    } finally {
      setIsLoading(false);
    }
  }

  fetchProfile();
}, []);

  if (isLoading) {
    return (
      <main className="page-container py-12">
        <div className="border-2 border-black bg-yellow-300 p-6 shadow-[6px_6px_0_0_#000]">
          <p className="font-black uppercase">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !profile) {
    return (
      <main className="page-container py-12">
        <div className="border-2 border-black bg-red-300 p-6 shadow-[6px_6px_0_0_#000]">
          <p className="font-black uppercase">
            {errorMessage ?? "Profile not found"}
          </p>

<button
  type="button"
  onClick={() => window.location.reload()}
  className="mt-5 flex items-center gap-2 border-2 border-black bg-white px-4 py-3 font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
>
  <ArrowClockwise size={20} weight="bold" />
  RETRY
</button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container py-10 sm:py-14">
      {/* Header */}
      <section className="mb-10">
        <p className="mb-3 text-sm font-black uppercase tracking-widest">
          Account
        </p>

        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
          My Profile
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-600">
          Manage your account information and view your
          coffee shop orders.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        {/* Profile Card */}
        <section className="h-fit border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
          <div className="border-b-2 border-black bg-orange-400 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center border-2 border-black bg-white">
                <UserCircle
                  size={42}
                  weight="bold"
                />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-black uppercase">
                  {profile.name}
                </h2>

                <p className="mt-1 text-sm font-bold uppercase">
                  {profile.role}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y-2 divide-black">
            <div className="flex gap-4 p-5">
              <Envelope
                size={24}
                weight="bold"
                className="shrink-0"
              />

              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-zinc-500">
                  Email
                </p>

                <p className="mt-1 break-all font-bold">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5">
              <Phone
                size={24}
                weight="bold"
                className="shrink-0"
              />

              <div>
                <p className="text-xs font-black uppercase text-zinc-500">
                  Phone
                </p>

                <p className="mt-1 font-bold">
                  {profile.phoneNumber}
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5">
              <Clock
                size={24}
                weight="bold"
                className="shrink-0"
              />

              <div>
                <p className="text-xs font-black uppercase text-zinc-500">
                  Member Since
                </p>

                <p className="mt-1 font-bold">
                  {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Orders */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-widest">
                History
              </p>

              <h2 className="mt-1 text-3xl font-black uppercase">
                My Orders
              </h2>
            </div>

            <div className="flex items-center gap-2 border-2 border-black bg-yellow-300 px-3 py-2 font-black">
              <Package size={20} weight="bold" />
              {orders.length}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="border-2 border-black bg-white p-8 text-center shadow-[5px_5px_0_0_#000]">
              <Package
                size={48}
                weight="bold"
                className="mx-auto"
              />

              <h3 className="mt-4 text-xl font-black uppercase">
                No Orders Yet
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                Your order history will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="border-2 border-black bg-white shadow-[5px_5px_0_0_#000]"
                >
                  {/* Order Header */}
                  <div className="flex flex-col gap-4 border-b-2 border-black bg-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase text-zinc-500">
                        Order ID
                      </p>

                      <p className="mt-1 break-all font-black">
                        #{order.id}
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

                  {/* Items */}
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

                  {/* Total */}
                  <div className="border-t-2 border-black bg-yellow-300 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-black uppercase">
                        Total
                      </span>

                      <span className="text-xl font-black">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <div className="mt-3 flex justify-between gap-4 text-xs font-bold">
                      <span>
                        Subtotal:{" "}
                        {formatPrice(order.subtotal)}
                      </span>

                      <span>
                        Tax {order.taxPercentage}%:{" "}
                        {formatPrice(order.taxAmount)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}