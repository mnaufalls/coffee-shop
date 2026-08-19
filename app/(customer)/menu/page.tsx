import Link from "next/link";
import { ArrowRight, Coffee } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import MenuFilter from "@/components/customer/menu-filter";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  isAvailable: boolean;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
};

type MenuPageProps = {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
  }>;
};

async function getCategories(): Promise<Category[]> {
  const response = await fetch("http://localhost:3000/api/categories", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const result: { data: Category[] } = await response.json();

  return result.data;
}

async function getProducts(
  search?: string,
  categoryId?: string,
): Promise<Product[]> {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (categoryId) {
    params.set("categoryId", categoryId);
  }

  const query = params.toString();

  const response = await fetch(
    `http://localhost:3000/api/products${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const result: { data: Product[] } = await response.json();

  return result.data;
}

function formatPrice(price: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = !product.isAvailable || product.stock <= 0;

  const cardContent = (
    <>
      <div className="relative aspect-square border-b-2 border-black bg-zinc-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Coffee size={80} weight="duotone" />
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/55">
            <span className="rotate-[-8deg] border-2 border-black bg-white px-4 py-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase shadow-[3px_3px_0_0_#000]">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="font-[family-name:var(--font-dm-sans)] text-xs font-extrabold uppercase text-orange-600">
          {product.category.name}
        </p>

        <h2 className="mt-1 font-[family-name:var(--font-bricolage)] text-xl font-extrabold uppercase">
          {product.name}
        </h2>

        <p className="mt-2 line-clamp-2 font-[family-name:var(--font-dm-sans)] text-sm leading-6 text-zinc-600">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-[family-name:var(--font-dm-sans)] text-lg font-extrabold">
            {formatPrice(product.price)}
          </span>

          {!isOutOfStock && (
            <span className="flex h-9 w-9 items-center justify-center border-2 border-black bg-yellow-300">
              <ArrowRight
                size={20}
                weight="bold"
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (isOutOfStock) {
    return (
      <div className="group overflow-hidden border-2 border-black bg-white opacity-65 shadow-[5px_5px_0_0_#000] grayscale">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/menu/${product.id}`}
      className="group block overflow-hidden border-2 border-black bg-white shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
    >
      {cardContent}
    </Link>
  );
}

export default async function MenuPage({
  searchParams,
}: MenuPageProps) {
  const params = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(params.search, params.categoryId),
  ]);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <section className="border-b-2 border-black bg-yellow-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="mb-3 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase">
            Our Menu
          </p>

          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <h1 className="font-[family-name:var(--font-bricolage)] text-5xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                Pick Your
                <br />
                <span className="text-orange-600">Favorite.</span>
              </h1>

              <p className="mt-5 max-w-xl font-[family-name:var(--font-dm-sans)] text-base font-medium leading-7 text-zinc-800 sm:text-lg">
                Browse our coffee, drinks, and food. Find your favorite and
                order it in a few clicks.
              </p>
            </div>

            <div className="w-fit border-2 border-black bg-white px-5 py-3 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase shadow-[4px_4px_0_0_#000]">
              {products.length}{" "}
              {products.length === 1 ? "Product" : "Products"}
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <MenuFilter categories={categories} />

        <div className="mt-10">
          {products.length === 0 ? (
            <div className="border-2 border-black bg-white px-6 py-16 text-center shadow-[5px_5px_0_0_#000]">
              <Coffee
                size={64}
                weight="duotone"
                className="mx-auto mb-5"
              />

              <h2 className="font-[family-name:var(--font-bricolage)] text-3xl font-extrabold uppercase">
                No Products Found
              </h2>

              <p className="mt-3 font-[family-name:var(--font-dm-sans)] text-sm text-zinc-600 sm:text-base">
                Try another search or category.
              </p>

              <Link
                href="/menu"
                className="mt-7 inline-flex items-center gap-2 border-2 border-black bg-yellow-300 px-5 py-3 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                View All Products
                <ArrowRight size={18} weight="bold" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between">
                <p className="font-[family-name:var(--font-dm-sans)] text-sm font-bold text-zinc-600">
                  Showing{" "}
                  <span className="font-extrabold text-black">
                    {products.length}
                  </span>{" "}
                  {products.length === 1 ? "item" : "items"}
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