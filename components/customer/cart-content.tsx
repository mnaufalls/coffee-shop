"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash,
} from "@phosphor-icons/react";

import { useCartStore } from "@/store/cart-store";
import CheckoutForm from "@/components/customer/checkout-form";
import Image from "next/image";

function formatPrice(price: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

type CartContentProps = {
  isAuthenticated: boolean;
};

export default function CartContent({
  isAuthenticated,
}: CartContentProps) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore(
    (state) => state.updateQuantity,
  );
  const removeItem = useCartStore(
    (state) => state.removeItem,
  );

  const subtotal = items.reduce(
    (total, item) =>
      total + Number(item.product.price) * item.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#f5f0e8] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl border-2 border-black bg-white p-10 text-center shadow-[6px_6px_0_0_#000]">
          <ShoppingBag
            size={80}
            weight="duotone"
            className="mx-auto mb-6"
          />

          <h1 className="text-3xl font-black uppercase">
            Your Cart Is Empty
          </h1>

          <p className="mt-3 text-zinc-600">
            Pick something delicious from our menu.
          </p>

          <Link
            href="/menu"
            className="mt-8 inline-flex items-center gap-2 border-2 border-black bg-yellow-300 px-6 py-3 font-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            BROWSE MENU
            <ArrowRight size={20} weight="bold" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5f0e8]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/menu"
          className="mb-8 inline-flex items-center gap-2 font-black underline underline-offset-4"
        >
          <ArrowLeft size={20} weight="bold" />
          CONTINUE SHOPPING
        </Link>

        <div className="mb-8">
          <p className="font-black uppercase text-orange-600">
            Your Order
          </p>

          <h1 className="mt-1 text-4xl font-black uppercase sm:text-5xl">
            Shopping Cart
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="grid gap-5 border-2 border-black bg-white p-5 shadow-[5px_5px_0_0_#000] sm:grid-cols-[120px_1fr_auto]"
              >
               <div className="relative flex aspect-square items-center justify-center border-2 border-black bg-zinc-100">
                  {item.product.imageUrl ? (
                    <Image
  src={item.product.imageUrl}
  alt={item.product.name}
  fill
  sizes="120px"
  className="object-cover"
/>
                  ) : (
                    <ShoppingBag size={48} weight="duotone" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-black uppercase text-orange-600">
                    {item.product.category?.name}
                  </p>

                  <h2 className="mt-1 text-xl font-black uppercase">
                    {item.product.name}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-600">
                    {formatPrice(item.product.price)}
                  </p>

                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex border-2 border-black">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1,
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center border-r-2 border-black disabled:opacity-40"
                        aria-label={`Decrease ${item.product.name} quantity`}
                      >
                        <Minus size={16} weight="bold" />
                      </button>

                      <span className="flex h-9 w-10 items-center justify-center bg-yellow-300 text-sm font-black">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1,
                          )
                        }
                        disabled={
                          item.quantity >= item.product.stock
                        }
                        className="flex h-9 w-9 items-center justify-center border-l-2 border-black disabled:opacity-40"
                        aria-label={`Increase ${item.product.name} quantity`}
                      >
                        <Plus size={16} weight="bold" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.product.id)
                      }
                      className="flex items-center gap-1 text-sm font-black text-red-600 underline"
                    >
                      <Trash size={16} weight="bold" />
                      REMOVE
                    </button>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-lg font-black">
                    {formatPrice(
                      String(
                        Number(item.product.price) *
                          item.quantity,
                      ),
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="h-fit border-2 border-black bg-yellow-300 p-6 shadow-[6px_6px_0_0_#000]">
            <h2 className="text-2xl font-black uppercase">
              Order Summary
            </h2>

            <div className="my-6 border-t-2 border-black pt-5">
  <div className="flex justify-between gap-4 font-bold">
    <span>Subtotal</span>
    <span>{formatPrice(String(subtotal))}</span>
  </div>

  <p className="mt-3 text-xs font-medium text-zinc-700">
    Tax and final total will be calculated by the backend
    during checkout.
  </p>
</div>

<CheckoutForm isAuthenticated={isAuthenticated} />
          </aside>
        </div>
      </div>
    </main>
  );
}