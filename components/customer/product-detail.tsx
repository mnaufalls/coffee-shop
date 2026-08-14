"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
} from "@phosphor-icons/react";
import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cart-store";

type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
};

type ProductDetailProps = {
  product: Product;
};

function formatPrice(price: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default function ProductDetail({
  product,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = product.stock <= 0;

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(product.stock, current + 1),
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5f0e8]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/menu"
          className="mb-8 inline-flex items-center gap-2 font-black underline underline-offset-4"
        >
          <ArrowLeft size={20} weight="bold" />
          BACK TO MENU
        </Link>

        <div className="grid overflow-hidden border-2 border-black bg-white shadow-[7px_7px_0_0_#000] lg:grid-cols-2">
          {/* Product Image */}
          <div className="relative flex aspect-square items-center justify-center border-b-2 border-black bg-zinc-100 lg:border-b-0 lg:border-r-2">
            {product.imageUrl ? (
              <Image
  src={product.imageUrl}
  alt={product.name}
  fill
  sizes="(max-width: 1024px) 100vw, 50vw"
  className="object-cover"
/>
            ) : (
              <ShoppingBag
                size={150}
                weight="duotone"
              />
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <span className="rotate-[-8deg] border-2 border-black bg-white px-6 py-3 text-xl font-black shadow-[4px_4px_0_0_#000]">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="flex flex-col p-6 sm:p-10">
            <p className="text-sm font-black uppercase text-orange-600">
              {product.category.name}
            </p>

            <h1 className="mt-2 text-4xl font-black uppercase leading-tight sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 text-base leading-7 text-zinc-600">
              {product.description}
            </p>

            <div className="mt-8 border-y-2 border-black py-6">
              <p className="text-3xl font-black">
                {formatPrice(product.price)}
              </p>

              <p
                className={`mt-2 text-sm font-black uppercase ${
                  isOutOfStock
                    ? "text-red-600"
                    : "text-green-700"
                }`}
              >
                {isOutOfStock
                  ? "Currently unavailable"
                  : `${product.stock} available`}
              </p>
            </div>

            {!isOutOfStock && (
              <>
                <div className="mt-8">
                  <p className="mb-3 text-sm font-black uppercase">
                    Quantity
                  </p>

                  <div className="flex w-fit items-center border-2 border-black">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="flex h-12 w-12 items-center justify-center border-r-2 border-black bg-white font-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus size={20} weight="bold" />
                    </button>

                    <span className="flex h-12 w-14 items-center justify-center bg-yellow-300 font-black">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                      className="flex h-12 w-12 items-center justify-center border-l-2 border-black bg-white font-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={20} weight="bold" />
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                 <button
  type="button"
  onClick={() => addItem(product, quantity)}
  className="flex items-center justify-center gap-2 border-2 border-black bg-yellow-300 px-5 py-4 font-black shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
>
  <ShoppingBag size={21} weight="bold" />
  ADD TO CART
</button>

                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 border-2 border-black bg-black px-5 py-4 font-black text-white shadow-[5px_5px_0_0_#f59e0b] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  >
                    BUY NOW
                    <ArrowRight size={21} weight="bold" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}