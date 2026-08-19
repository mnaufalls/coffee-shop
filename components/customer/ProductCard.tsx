import Link from "next/link";
import { ArrowRight, Coffee } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = !product.isAvailable || product.stock <= 0;

  const cardContent = (
    <>
      <div className="relative aspect-square border-b-2 border-black bg-zinc-100">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Coffee size={80} weight="duotone" />
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/55">
            <span className="rotate-[-8deg] border-2 border-black bg-white px-4 py-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase shadow-[3px_3px_0_0_#000]">Sold Out</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="font-[family-name:var(--font-dm-sans)] text-xs font-extrabold uppercase text-orange-600">{product.category.name}</p>
        <h2 className="mt-1 font-[family-name:var(--font-bricolage)] text-xl font-extrabold uppercase">{product.name}</h2>
        <p className="mt-2 line-clamp-2 font-[family-name:var(--font-dm-sans)] text-sm leading-6 text-zinc-600">{product.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-[family-name:var(--font-dm-sans)] text-lg font-extrabold">{formatPrice(product.price)}</span>
          {!isOutOfStock && (
            <span className="flex h-9 w-9 items-center justify-center border-2 border-black bg-yellow-300">
              <ArrowRight size={20} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (isOutOfStock) {
    return <div className="group overflow-hidden border-2 border-black bg-white opacity-65 shadow-[5px_5px_0_0_#000] grayscale">{cardContent}</div>;
  }

  return (
    <Link href={`/menu/${product.id}`} className="group block overflow-hidden border-2 border-black bg-white shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
      {cardContent}
    </Link>
  );
}