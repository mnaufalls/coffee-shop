import Link from "next/link";
import { ArrowRight, Coffee } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="border-y-2 border-black bg-orange-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase text-orange-600">Our Picks</p>
            <h2 className="font-[family-name:var(--font-bricolage)] text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">Popular Menu</h2>
          </div>
          <Link href="/menu" className="hidden items-center gap-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase underline decoration-2 underline-offset-4 sm:flex">
            View Menu
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const isOutOfStock = !product.isAvailable || product.stock <= 0;
            return (
              <Link key={product.id} href={`/menu/${product.id}`} className={`group overflow-hidden border-2 border-black bg-white shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${isOutOfStock ? "opacity-60" : ""}`}>
                <div className="relative flex aspect-square items-center justify-center border-b-2 border-black bg-zinc-100">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <Coffee size={72} weight="duotone" />
                  )}
                </div>
                <div className="p-5">
                  <p className="mb-1 font-[family-name:var(--font-dm-sans)] text-xs font-extrabold uppercase text-zinc-500">{product.category.name}</p>
                  <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-extrabold uppercase">{product.name}</h3>
                  <p className="mt-2 line-clamp-2 font-[family-name:var(--font-dm-sans)] text-sm leading-6 text-zinc-600">{product.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="font-[family-name:var(--font-dm-sans)] text-lg font-extrabold">{formatPrice(product.price)}</span>
                    <span className={`border-2 border-black px-2 py-1 font-[family-name:var(--font-dm-sans)] text-[10px] font-extrabold uppercase ${isOutOfStock ? "bg-zinc-300" : "bg-green-300"}`}>
                      {isOutOfStock ? "Sold Out" : "Available"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <Link href="/menu" className="mt-8 inline-flex items-center gap-2 border-2 border-black bg-white px-5 py-3 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:hidden">
          View All Menu
          <ArrowRight size={18} weight="bold" />
        </Link>
      </div>
    </section>
  );
}