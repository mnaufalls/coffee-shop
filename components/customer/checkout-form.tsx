"use client";

import Link from "next/link";
import { ArrowRight, Check, LockKey } from "@phosphor-icons/react";
import { useState } from "react";

import { useCartStore } from "@/store/cart-store";


type OrderType = "dine_in" | "takeaway";

type CheckoutFormProps = {
  isAuthenticated?: boolean;
};

export default function CheckoutForm({
  isAuthenticated = false,
}: CheckoutFormProps) {
  const [orderType, setOrderType] =
    useState<OrderType>("dine_in")

  const [showCheckout, setShowCheckout] = useState(false);

  const items = useCartStore((state) => state.items);
  const [isSubmitting, setIsSubmitting] = useState(false);
const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!showCheckout) {
    return (
      <button
        type="button"
        onClick={() => setShowCheckout(true)}
        className="flex w-full items-center justify-center gap-2 border-2 border-black bg-black px-5 py-4 font-black text-white shadow-[5px_5px_0_0_#fff] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
      >
        CHECKOUT
        <ArrowRight size={20} weight="bold" />
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="border-t-2 border-black pt-6">
        <div className="border-2 border-black bg-white p-5">
          <div className="flex items-start gap-3">
            <LockKey
              size={26}
              weight="bold"
              className="shrink-0"
            />

            <div>
              <h3 className="font-black uppercase">
                Account Required
              </h3>

              <p className="mt-1 text-sm text-zinc-600">
                You need to login or create an account before
                placing an order.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 border-2 border-black bg-yellow-300 px-4 py-3 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              LOGIN
            </Link>

            <Link
              href="/register"
              className="flex items-center justify-center gap-2 border-2 border-black bg-white px-4 py-3 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              CREATE ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
onSubmit={async (event) => {
  event.preventDefault();

  if (isSubmitting || items.length === 0) {
    return;
  }

  setIsSubmitting(true);
  setErrorMessage(null);

  try {
    // 1. Create order
    const orderResponse = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderType,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      }),
    });

    const orderResult = await orderResponse.json();

    if (!orderResponse.ok) {
      setErrorMessage(
        orderResult.message ?? "Failed to create order",
      );
      return;
    }

    const orderId = orderResult.data?.order?.id;

    if (!orderId) {
      setErrorMessage("Order ID was not returned by the server.");
      return;
    }

    // 2. Generate Midtrans Snap token
    const paymentResponse = await fetch(
      "/api/payment/snap-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      },
    );

    const paymentResult = await paymentResponse.json();

    if (!paymentResponse.ok) {
      setErrorMessage(
        paymentResult.message ??
          "Failed to create Midtrans payment",
      );
      return;
    }

    const redirectUrl =
      paymentResult.data?.redirectUrl;

    if (!redirectUrl) {
      setErrorMessage(
        "Midtrans payment URL was not returned.",
      );
      return;
    }

    // 3. Open Midtrans payment page
    window.location.href = redirectUrl;
  } catch {
    setErrorMessage(
      "Unable to connect to the server. Please try again.",
    );
  } finally {
    setIsSubmitting(false);
  }
}}
      className="mt-6 space-y-7 border-t-2 border-black pt-6"
    >
      {/* Order Type */}
      <section>
        <h3 className="text-xl font-black uppercase">
          Order Type
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer items-center gap-3 border-2 border-black p-4 font-black transition-colors ${
              orderType === "dine_in"
                ? "bg-orange-400"
                : "bg-white hover:bg-orange-100"
            }`}
          >
            <input
              type="radio"
              name="orderType"
              value="dine_in"
              checked={orderType === "dine_in"}
              onChange={() => setOrderType("dine_in")}
              className="h-4 w-4 accent-black"
            />

            <span>Dine In</span>

            {orderType === "dine_in" && (
              <Check
                size={20}
                weight="bold"
                className="ml-auto"
              />
            )}
          </label>

          <label
            className={`flex cursor-pointer items-center gap-3 border-2 border-black p-4 font-black transition-colors ${
              orderType === "takeaway"
                ? "bg-orange-400"
                : "bg-white hover:bg-orange-100"
            }`}
          >
            <input
              type="radio"
              name="orderType"
              value="takeaway"
              checked={orderType === "takeaway"}
              onChange={() => setOrderType("takeaway")}
              className="h-4 w-4 accent-black"
            />

            <span>Takeaway</span>

            {orderType === "takeaway" && (
              <Check
                size={20}
                weight="bold"
                className="ml-auto"
              />
            )}
          </label>
        </div>
      </section>

      {/* Order Review */}
      <section>
        <h3 className="text-xl font-black uppercase">
          Order Review
        </h3>

        <div className="mt-4 border-2 border-black bg-white">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-start justify-between gap-4 border-b-2 border-black p-4 last:border-b-0"
            >
              <div>
                <p className="font-black uppercase">
                  {item.product.name}
                </p>

                <p className="mt-1 text-sm text-zinc-600">
                  {item.quantity} ×{" "}
                  {formatPrice(item.product.price)}
                </p>
              </div>

              <p className="shrink-0 font-black">
                {formatPrice(
                  String(
                    Number(item.product.price) *
                      item.quantity,
                  ),
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment */}
      <section>
        <h3 className="text-xl font-black uppercase">
          Payment
        </h3>

        <div className="mt-4 border-2 border-black bg-white p-4">
          <p className="font-black uppercase">
            Midtrans
          </p>

          <p className="mt-1 text-sm text-zinc-600">
            Payment will be completed securely through
            Midtrans.
          </p>
        </div>
      </section>

      {/* Total */}
      <section className="border-y-2 border-black py-5">
        <div className="flex items-center justify-between gap-4">
          <span className="font-black uppercase">
            Subtotal
          </span> 
        </div>

        <p className="mt-3 text-xs font-medium text-zinc-600">
          Final subtotal, tax, and total will be calculated
          again by the server when the order is created.
        </p>
      </section>

{errorMessage && (
  <div
    role="alert"
    className="border-2 border-black bg-red-300 p-4 text-sm font-bold"
  >
    {errorMessage}
  </div>
)}

<button
  type="submit"
  disabled={isSubmitting}
  className="flex w-full items-center justify-center gap-2 border-2 border-black bg-yellow-300 px-5 py-4 font-black shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
>
  {isSubmitting ? "PROCESSING..." : "CONFIRM ORDER"}

  {!isSubmitting && (
    <ArrowRight size={20} weight="bold" />
  )}
</button>
    </form>
  );
}

function formatPrice(price: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}