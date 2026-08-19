import Link from "next/link";
import { ArrowRight, ForkKnife } from "@phosphor-icons/react/dist/ssr";
import type { Category } from "@/types";

export function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase text-orange-500">Explore</p>
          <h2 className="font-[family-name:var(--font-bricolage)] text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">Browse Categories</h2>
        </div>
        <Link href="/menu" className="hidden items-center gap-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase underline decoration-2 underline-offset-4 sm:flex">
          See All
          <ArrowRight size={18} weight="bold" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <Link key={category.id} href={`/menu?categoryId=${category.id}`} className="group flex items-center justify-between border-2 border-black bg-white p-5 shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black ${index % 2 === 0 ? "bg-yellow-300" : "bg-pink-300"}`}>
                <ForkKnife size={24} weight="bold" />
              </div>
              <span className="font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase sm:text-base">{category.name}</span>
            </div>
            <ArrowRight size={22} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}