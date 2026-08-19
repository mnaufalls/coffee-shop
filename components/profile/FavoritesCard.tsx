import Link from "next/link";
import { Receipt, Star } from "@phosphor-icons/react";

type Favorite = {
  productId: string;
  productName: string;
  totalQuantity: number;
};

export function FavoritesCard({ favorites }: { favorites: Favorite[] }) {
  return (
    <section className="grid gap-6 sm:grid-cols-2">
      <Link
        href="/orders"
        className="flex flex-col items-center justify-center border-2 border-black bg-[#FF9100] p-6 text-center shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
      >
        <Receipt size={48} weight="bold" className="mb-4" />
        <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-black uppercase">
          Order History
        </h3>
        <p className="mt-2 text-sm font-bold text-zinc-700">View your past brews and favorites.</p>
        <span className="mt-6 inline-flex border-2 border-black bg-white px-6 py-3 font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase text-sm">
          View History
        </span>
      </Link>

      <div className="border-2 border-black bg-yellow-300 p-6 shadow-[5px_5px_0_0_#000]">
        <div className="flex items-center gap-3 mb-4">
          <Star size={32} weight="fill" className="text-black" />
          <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-black uppercase">
            Favorites
          </h3>
        </div>
        {favorites.length === 0 ? (
          <p className="text-sm font-bold text-zinc-700">
            No favorites yet. Start ordering to see your top picks here!
          </p>
        ) : (
          <div className="space-y-2">
            {favorites.slice(0, 3).map((item, idx) => (
              <div key={item.productId} className="flex items-center justify-between border-2 border-black bg-white p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center border-2 border-black bg-orange-300 text-xs font-black">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-bold">{item.productName}</span>
                </div>
                <span className="text-xs font-black">{item.totalQuantity}x</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}