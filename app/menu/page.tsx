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
      <section className="border-b-2 border-black bg-yellow-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-2 font-black uppercase">Our Menu</p>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tight sm:text-6xl">
                Pick Your
                <br />
                <span className="text-orange-600">Favorite.</span>
              </h1>

              <p className="mt-4 max-w-xl font-medium text-zinc-800">
                Browse our coffee, drinks, and food. Find your favorite and
                order it in a few clicks.
              </p>
            </div>

            <div className="border-2 border-black bg-white px-5 py-3 font-black shadow-[4px_4px_0_0_#000]">
              {products.length} PRODUCTS
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <MenuFilter categories={categories} />

        <div className="mt-10">
          {products.length === 0 ? (
            <div className="border-2 border-black bg-white px-6 py-16 text-center shadow-[5px_5px_0_0_#000]">
              <Coffee
                size={64}
                weight="duotone"
                className="mx-auto mb-5"
              />

              <h2 className="text-2xl font-black uppercase">
                No products found
              </h2>

              <p className="mt-2 text-zinc-600">
                Try another search or category.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const isOutOfStock = product.stock <= 0;

                return (
                  <Link
                    key={product.id}
                    href={`/menu/${product.id}`}
                    aria-disabled={isOutOfStock}
                    className={`group overflow-hidden border-2 border-black bg-white shadow-[5px_5px_0_0_#000] ${
                      isOutOfStock
                        ? "cursor-not-allowed grayscale"
                        : "transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    }`}
                  >
                    <div className="relative aspect-square border-b-2 border-black bg-zinc-100">
                      {product.imageUrl ? (
                       <Image
  src={product.imageUrl}
  alt={product.name}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  className="object-cover"
/>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Coffee size={80} weight="duotone" />
                        </div>
                      )}

                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                          <span className="rotate-[-8deg] border-2 border-black bg-white px-4 py-2 font-black shadow-[3px_3px_0_0_#000]">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-black uppercase text-orange-600">
                        {product.category.name}
                      </p>

                      <h2 className="mt-1 text-xl font-black uppercase">
                        {product.name}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                        {product.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="text-lg font-black">
                          {formatPrice(product.price)}
                        </span>

                        {!isOutOfStock && (
                          <ArrowRight
                            size={22}
                            weight="bold"
                            className="transition-transform group-hover:translate-x-1"
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}