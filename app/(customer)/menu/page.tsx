import Link from "next/link";
import { ArrowRight, Coffee } from "@phosphor-icons/react/dist/ssr";
import { getCategories, getProducts } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import MenuFilter from "@/components/customer/menu-filter";
import { ProductCard } from "@/components/customer/ProductCard";

type MenuPageProps = {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
  }>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(params.search, params.categoryId),
  ]);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <section className="border-b-2 border-black bg-yellow-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="mb-3 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase">Our Menu</p>
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <h1 className="font-[family-name:var(--font-bricolage)] text-5xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                Pick Your
                <br />
                <span className="text-orange-600">Favorite.</span>
              </h1>
              <p className="mt-5 max-w-xl font-[family-name:var(--font-dm-sans)] text-base font-medium leading-7 text-zinc-800 sm:text-lg">
                Browse our coffee, drinks, and food. Find your favorite and order it in a few clicks.
              </p>
            </div>
            <div className="w-fit border-2 border-black bg-white px-5 py-3 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase shadow-[4px_4px_0_0_#000]">
              {products.length} {products.length === 1 ? "Product" : "Products"}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <MenuFilter categories={categories} />
        <div className="mt-10">
          {products.length === 0 ? (
            <div className="border-2 border-black bg-white px-6 py-16 text-center shadow-[5px_5px_0_0_#000]">
              <Coffee size={64} weight="duotone" className="mx-auto mb-5" />
              <h2 className="font-[family-name:var(--font-bricolage)] text-3xl font-extrabold uppercase">No Products Found</h2>
              <p className="mt-3 font-[family-name:var(--font-dm-sans)] text-sm text-zinc-600 sm:text-base">Try another search or category.</p>
              <Link href="/menu" className="mt-7 inline-flex items-center gap-2 border-2 border-black bg-yellow-300 px-5 py-3 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                View All Products
                <ArrowRight size={18} weight="bold" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between">
                <p className="font-[family-name:var(--font-dm-sans)] text-sm font-bold text-zinc-600">
                  Showing <span className="font-extrabold text-black">{products.length}</span> {products.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}