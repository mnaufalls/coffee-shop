import Link from "next/link";
import { ArrowRight, Coffee, ForkKnife } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

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

async function getProducts(): Promise<Product[]> {
  const response = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

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

export default async function Home() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="bg-[#f5f0e8]">
      {/* Hero */}
      <section className="border-b-2 border-black">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 font-bold shadow-[4px_4px_0_0_#000]">
              <Coffee size={20} weight="bold" />
              YOUR DAILY COFFEE
            </div>

            <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Good Coffee.
              <br />
              <span className="text-orange-500">Good Mood.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-zinc-700">
              Nikmati kopi favoritmu dengan mudah. Pilih menu, masukkan ke
              cart, dan pesan tanpa ribet.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 border-2 border-black bg-black px-6 py-3 font-black text-white shadow-[5px_5px_0_0_#f59e0b] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                ORDER NOW
                <ArrowRight size={20} weight="bold" />
              </Link>

              <Link
                href="/menu"
                className="inline-flex items-center gap-2 border-2 border-black bg-white px-6 py-3 font-black shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                VIEW MENU
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-[360px] items-center justify-center">
            <div className="absolute right-4 top-4 h-64 w-64 rotate-6 border-2 border-black bg-orange-400 sm:h-80 sm:w-80" />

            <div className="relative z-10 flex h-64 w-64 -rotate-3 items-center justify-center border-2 border-black bg-white shadow-[8px_8px_0_0_#000] sm:h-80 sm:w-80">
              <Coffee
                size={150}
                weight="duotone"
                className="text-black sm:h-[190px] sm:w-[190px]"
              />
            </div>

            <div className="absolute bottom-2 left-4 z-20 rotate-3 border-2 border-black bg-pink-300 px-4 py-3 font-black shadow-[4px_4px_0_0_#000]">
              FRESHLY BREWED
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-black uppercase text-orange-500">
              Explore
            </p>
            <h2 className="text-3xl font-black uppercase sm:text-4xl">
              Browse Categories
            </h2>
          </div>

          <Link
            href="/menu"
            className="hidden items-center gap-2 font-black underline underline-offset-4 sm:flex"
          >
            See all
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/menu?categoryId=${category.id}`}
              className="group flex items-center justify-between border-2 border-black bg-white p-5 shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-yellow-300">
                  <ForkKnife size={24} weight="bold" />
                </div>

                <span className="font-black uppercase">
                  {category.name}
                </span>
              </div>

              <ArrowRight
                size={22}
                weight="bold"
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section className="border-y-2 border-black bg-orange-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-black uppercase text-orange-600">
                Our Picks
              </p>
              <h2 className="text-3xl font-black uppercase sm:text-4xl">
                Popular Products
              </h2>
            </div>

            <Link
              href="/menu"
              className="hidden items-center gap-2 font-black underline underline-offset-4 sm:flex"
            >
              View menu
              <ArrowRight size={18} weight="bold" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;

              return (
                <Link
                  key={product.id}
                  href={`/menu/${product.id}`}
                  className={`group border-2 border-black bg-white shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                    isOutOfStock ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex aspect-square items-center justify-center border-b-2 border-black bg-zinc-100">
                    {product.imageUrl ? (
                     <Image
  src={product.imageUrl}
  alt={product.name}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  className="object-cover"
/>
                    ) : (
                      <Coffee size={72} weight="duotone" />
                    )}
                  </div>

                  <div className="p-5">
                    <p className="mb-1 text-xs font-bold uppercase text-zinc-500">
                      {product.category.name}
                    </p>

                    <h3 className="text-xl font-black uppercase">
                      {product.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-lg font-black">
                        {formatPrice(product.price)}
                      </span>

                      <span
                        className={`border-2 border-black px-2 py-1 text-xs font-black ${
                          isOutOfStock
                            ? "bg-zinc-300"
                            : "bg-green-300"
                        }`}
                      >
                        {isOutOfStock ? "SOLD OUT" : "AVAILABLE"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="border-2 border-black bg-black p-8 text-white shadow-[8px_8px_0_0_#f59e0b] sm:p-12">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="mb-2 font-black uppercase text-yellow-300">
                Ready to order?
              </p>

              <h2 className="max-w-2xl text-3xl font-black uppercase sm:text-5xl">
                Your next cup is waiting.
              </h2>
            </div>

            <Link
              href="/menu"
              className="inline-flex shrink-0 items-center gap-2 border-2 border-black bg-yellow-300 px-6 py-3 font-black text-black shadow-[5px_5px_0_0_#fff] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              EXPLORE MENU
              <ArrowRight size={20} weight="bold" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}